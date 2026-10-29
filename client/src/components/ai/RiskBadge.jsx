// RiskBadge.jsx
import Badge from '../common/Badge';
export default function RiskBadge({ level }) {
  return <Badge color={level === 'high' ? 'red' : level === 'medium' ? 'yellow' : 'green'}>{level} risk</Badge>;
}