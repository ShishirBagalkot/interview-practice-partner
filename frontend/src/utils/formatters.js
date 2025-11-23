export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatScore = (score) => {
  if (score >= 90) return { text: 'Excellent', color: 'green' };
  if (score >= 75) return { text: 'Good', color: 'blue' };
  if (score >= 60) return { text: 'Average', color: 'orange' };
  return { text: 'Needs Improvement', color: 'red' };
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
