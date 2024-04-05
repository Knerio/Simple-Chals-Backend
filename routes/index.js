const express = require('express');
const router = express.Router();
const fs = require('fs');

router.get('/mod/:jarName', (req, res) => {
  const jarName = req.params.jarName;
  const filePath = "mods/" + jarName;

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Jar file not found');
  }

  res.setHeader('Content-Disposition', `attachment; filename="${jarName}"`);
  res.setHeader('Content-Type', 'application/java-archive');

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});


module.exports = router;
