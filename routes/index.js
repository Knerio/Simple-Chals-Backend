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

router.get('/mods', (req, res) => {
  fs.readdir("./mods", (err, files) => {
    if (err) {
      return res.status(500).send('Error reading directory');
    }

    res.json(files
        .filter(file => file.endsWith(".jar"))
        .map(fileName => {
          return fileName.replace(".jar", "");
        }));
  });
})


module.exports = router;
