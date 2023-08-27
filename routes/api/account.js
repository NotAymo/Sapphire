const express = require('express')
const router = express.Router()

const con = require('../../other/mysqlConnection')
const logger = require('../../other/logger')
const config = require('../../config.json')

const moment = require('moment')

const { placeholderBio } = require('../../config.json')

const fetch = require('node-fetch')

router.get('/person', function(req, res) {
    const regExp = new RegExp(' ', 'g')
    const token = req.query["token"].replace(regExp, "+")

    con.query(`SELECT * FROM account WHERE serviceToken="${token}"`, function (err, result, fields) {
        if (err) { throw err }

        console.log(logger.Get(req.originalUrl))

        if (JSON.stringify(result).replace('[]', '')) {
            console.log(logger.Info('Found account!'))
            res.send(result)
        } else {
            console.log(logger.Error('Could not find account matching that token..'))
            res.send('')
        }
        
    })
})

router.post('/', (req, res) => {
    console.log(logger.Info(req.originalUrl))

    const serviceToken = req.get('x-nintendo-servicetoken').slice(0, 42)
    const nnid = req.get('NNID')

    console.log(logger.MySQL(`Creating New Account For ${nnid}`))

    con.query(`SELECT * FROM account WHERE nnid="${nnid}"`, function (err, result, fields) {
        if (err) { throw err }

        console.log(result)

        if (JSON.stringify(result).replace('[]', '')) {
            console.log(logger.Error(`There has already been an account created for ${nnid}`))
            res.send('{ success : 0 }')
        } else {
            fetch(`https://nnidlt.murilo.eu.org/api.php?env=production&user_id=${nnid}`).then(response => response.text()).then(response => {
                const responseObject = JSON.parse(response)

                con.query(`INSERT INTO account (nnid, serviceToken, name, bio, admin, pid, mii, hash) VALUES("${responseObject.user_id}", "${serviceToken}", "${responseObject.name}", "${config.placeholderBio}", 0, ${responseObject.pid}, "${responseObject.data}", "${responseObject.images.hash}");`, function (err, result, fields) {
                    if (err) {throw err} else {
                        console.log(logger.MySQL('Account Created!'))
                        res.send('{ success : 1 }')
                    }   
                })

            })
        }
    })
})

module.exports = router