const express = require('express');
const router = express.Router();
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

router.get('/latest/:name', async (req, res) => {
  const name = req.params.name;

  const response = await fetch(`https://api.github.com/users/Knerio/packages/maven/de.derioo.mods.${name}/versions`, {
    headers: {
      'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN,
    }
  });


  if (!response.ok) {
    throw new Error('Failed to fetch packages');
  }

  const data = await response.json();
  let latest = null;
  let latestUpdate = 0;


  for (let i = 0; i < data.length; i++) {
    const updated = new Date(data[i]["updated_at"]).getTime();
    if (latest === null) {
      latest = data[i].name;
      latestUpdate = updated;
      continue
    }
    if (latestUpdate > updated) {
      latest = data[i].name;
      latestUpdate = updated
    }

  }
  console.log(name)
  console.log(latest)
  const url = `https://maven.pkg.github.com/Knerio/Simple-Chals-Server/de.derioo.mods.${name}/${latest}/${name}-${latest}-dev.jar`

  const response2 = await axios({
    url: url,
    method: 'GET',
    responseType: 'arraybuffer',
    headers: {
      "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`
    }
  });



  res.setHeader('Content-Disposition', `attachment; filename="${name}.jar"`);
  res.setHeader('Content-Type', 'application/java-archive');

  res.send(response2.data);
});

router.get('/mods', async (req, res) => {
  try {

    const response = await fetch(`https://api.github.com/users/Knerio/packages?package_type=maven`, {
      headers: {
        'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN,
      }
    });


    if (!response.ok) {
      throw new Error('Failed to fetch packages');
    }

    const data = await response.json();
    const jsonResponse = [];


    for (let i = 0; i < data.length; i++) {
      const name = data[i].name;
      if (!name.startsWith("de.derioo.mods.")) continue;
      jsonResponse.push(name.replace("de.derioo.mods.", ""))
    }

    res.json(jsonResponse);
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});


module.exports = router;
