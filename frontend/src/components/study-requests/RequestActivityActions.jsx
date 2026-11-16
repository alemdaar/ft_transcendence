import { Link } from 'react-router-dom';
import Button from '../ui/Button';

export default function RequestActivityActions({ request, scope, onEdit, onDelete }) {
  return <div className="mt-5 flex flex-wrap justify-end gap-2">
    {scope === 'mine' && <><Button variant="ghost" onClick={() => onEdit(request)}>Edit</Button><Button variant="danger" onClick={() => onDelete(request)}>Delete</Button></>}
    {['pending', 'claimed'].includes(request.status) && <Link className="btn-primary" to={'/sessions/' + request.id}>Open session</Link>}
  </div>;
}
