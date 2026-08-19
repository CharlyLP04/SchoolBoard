import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, html } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'pruebasschool6@gmail.com',
        pass: 'hnddiqfqxemnvfii'
      }
    });

    await transporter.sendMail({
      from: '"SchoolBoard" <pruebasschool6@gmail.com>',
      to,
      subject,
      html
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error enviando correo por Vercel API:', error);
    return res.status(500).json({ error: error.message });
  }
}
