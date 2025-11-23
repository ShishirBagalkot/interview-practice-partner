class ScoringService {
  static calculateScore(evaluation) {
    // Basic scoring logic - can be enhanced
    let score = evaluation.overallScore || 0;
    
    // Adjust based on strengths and weaknesses
    const strengthCount = evaluation.strengths?.length || 0;
    const improvementCount = evaluation.areasForImprovement?.length || 0;
    
    // Bonus for more strengths
    score += strengthCount * 2;
    
    // Penalty for more improvements needed
    score -= improvementCount * 1;
    
    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, score));
  }

  static categorizePerformance(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Average';
    if (score >= 40) return 'Below Average';
    return 'Needs Improvement';
  }

  static generateRecommendations(evaluation) {
    const recommendations = [];
    
    if (evaluation.areasForImprovement) {
      evaluation.areasForImprovement.forEach(area => {
        recommendations.push(`Focus on improving: ${area}`);
      });
    }
    
    return recommendations;
  }
}

module.exports = ScoringService;
