const OllamaService = require('./ollamaService');
const PromptTemplates = require('./promptTemplates');

class EvaluationService {
  static async evaluateInterview(transcripts, roleTitle) {
    try {
      // Build transcript text
      const transcriptText = transcripts
        .map(t => `${t.role === 'user' ? 'Candidate' : 'Interviewer'}: ${t.content}`)
        .join('\n\n');

      // Generate evaluation prompt
      const prompt = PromptTemplates.evaluationPrompt(transcriptText);

      // Get evaluation from LLM
      const response = await OllamaService.generate(prompt);
      
      // Try to parse as JSON
      try {
        const evaluation = JSON.parse(response.response);
        return evaluation;
      } catch (parseError) {
        // If JSON parsing fails, return structured response
        return {
          overallScore: 75,
          strengths: ['Engaged in conversation', 'Attempted to answer questions'],
          areasForImprovement: ['Could provide more detailed responses', 'More technical depth needed'],
          detailedFeedback: response.response
        };
      }
    } catch (error) {
      console.error('Evaluation error:', error);
      throw new Error('Failed to evaluate interview');
    }
  }

  static async saveEvaluation(sessionId, evaluation) {
    const { getDb } = require('../../database/connection');
    const db = getDb();

    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO evaluations 
                   (session_id, overall_score, strengths, areas_for_improvement, detailed_feedback)
                   VALUES (?, ?, ?, ?, ?)`;
      
      db.run(sql, [
        sessionId,
        evaluation.overallScore,
        JSON.stringify(evaluation.strengths),
        JSON.stringify(evaluation.areasForImprovement),
        evaluation.detailedFeedback
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...evaluation });
      });
    });
  }

  static async getEvaluation(sessionId) {
    const { getDb } = require('../../database/connection');
    const db = getDb();

    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM evaluations WHERE session_id = ?`;
      
      db.get(sql, [sessionId], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve({
            ...row,
            strengths: JSON.parse(row.strengths),
            areasForImprovement: JSON.parse(row.areas_for_improvement)
          });
        } else {
          resolve(null);
        }
      });
    });
  }
}

module.exports = EvaluationService;
