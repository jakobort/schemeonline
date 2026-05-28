const { supabase, getUser } = require('../_supabase');

const cors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
};

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'No autorizado' });

  const { id } = req.query;

  // PUT — update
  if (req.method === 'PUT') {
    const body = { ...req.body };
    delete body.user_id;
    if (Array.isArray(body.dias)) body.dias = JSON.stringify(body.dias);

    const { error } = await supabase
      .from('asignaturas')
      .update(body)
      .eq('id_asignaturas', id)
      .eq('user_id', user.id);

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  // DELETE
  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('asignaturas')
      .delete()
      .eq('id_asignaturas', id)
      .eq('user_id', user.id);

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  res.status(405).end();
};
