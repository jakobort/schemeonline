const { supabase } = require('../_supabase');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });

  const { data, error } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (error) return res.status(400).json({ error: error.message });

  const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
  if (loginErr) return res.status(400).json({ error: loginErr.message });

  res.json({
    user: { id: data.user.id, email: data.user.email },
    session: loginData.session,
  });
};
