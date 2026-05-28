const { supabase, getUser } = require('../_supabase');

const cors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
};

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'No autorizado' });

  // GET — list subjects
  if (req.method === 'GET') {
    const semestre = req.query.semestre || '2025-2';
    const { data, error } = await supabase
      .from('asignaturas')
      .select('*')
      .eq('user_id', user.id)
      .eq('semestre', semestre)
      .order('hora_inicio', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    const result = data.map(row => ({
      ...row,
      dias: typeof row.dias === 'string' ? JSON.parse(row.dias) : (row.dias || []),
    }));
    return res.json(result);
  }

  // POST — create subject
  if (req.method === 'POST') {
    const body = { ...req.body, user_id: user.id };
    if (Array.isArray(body.dias)) body.dias = JSON.stringify(body.dias);

    const { data, error } = await supabase
      .from('asignaturas')
      .insert(body)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, id: data.id_asignaturas });
  }

  res.status(405).end();
};
