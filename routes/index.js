const express = require('express');
const router = express.Router();
const {Readable} = require("stream")
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
    const latestPackage = data.reduce((acc, item) => {
        const updatedItem = new Date(item["updated_at"]).getTime();
        const updatedAcc = new Date(acc["updated_at"]).getTime();
        if (updatedAcc > updatedItem) return acc;
        return item;
    }, {"updated_at": 0});

    console.log(latestPackage.name)
    const latestJarURL = `https://maven.pkg.github.com/Knerio/Simple-Chals-Server/de.derioo.mods.${name}/${latestPackage.name}/${name}-${latestPackage.name}.jar`

    const jarResponse = await fetch(latestJarURL, {
        method: 'GET',
        responseType: 'blob',
        headers: {
            "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`
        }
    })


    res.setHeader('Content-Disposition', `attachment; filename="${name}.jar"`);
    res.setHeader('Content-Type', 'application/java-archive');
    Readable.fromWeb(jarResponse.body).pipe(res);

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
        res.status(500).json({error: 'Failed to fetch packages'});
    }
});


module.exports = router;
