const express = require('express')
const router = express.Router()

const json2xml = require('xml-js')

const con = require('../../../other/mysqlConnection')
const logger = require('../../../other/logger')

const { community_posts } = require('../../../config.json')

const multer = require('multer')

const moment = require('moment')
const xml = require('xml')

const xmlbuilder = require('xmlbuilder')

const fetch = require('node-fetch')
const fs = require('fs')

const pako = require('pako')
const PNG = require('pngjs').PNG
const TGA = require('tga')

const headerDecoder = require('../../../other/decoder')
const { title } = require('process')

const util = require('util')

const query = util.promisify(con.query).bind(con)

const icon = "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"

router.get('/', async (req, res) => {
    const communities = await query(`SELECT * FROM community AS c WHERE hidden=0 AND type="wiiu" 
    ORDER BY 
    (SELECT COUNT(community_id) FROM post WHERE community_id=c.community_id)
    DESC`)

    let xml = xmlbuilder.create('result')
    .e('has_error', '0').up()
    .e('version', '1').up()
    .e('request_name', 'topics').up()
    .e('expire', moment().add(1, 'day').format('YYYY-MM-DD HH:MM:SS')).up()
    .e('topics');

    for (let i = 0; i < communities.length; i++) {
        const community = communities[i];

        var posts = await query(`SELECT * FROM post WHERE community_id=${community.community_id} LIMIT 30`)

        xml = xml.e('topic')
        .e('empathy_count', '213').up()
        .e('has_shop_page', '1').up()
        .e('icon', String(fs.readFileSync(__dirname + `/files/encoded/${community.community_id}.txt`))).up()
        .e('title_ids');
        JSON.parse(community.title_ids).forEach(element => {
            xml = xml.e('title_id', element).up()
        });
        xml = xml.up()
        .e('title_id', JSON.parse(community.title_ids)[0]).up()
        .e('community_id', community.community_id).up()
        .e('is_recommended', community.recommended).up()
        .e('name', community.name).up()
        .e('people');
        for (const post of posts) {
            xml = xml.e('person')
            .e('posts')
            .e("post")
            .e('body', post.body).up()
            .e('community_id', community.community_id).up()
            .e('country_id', post.country_id).up()
            .e('created_at', post.created_at).up()
            .e('feeling_id', post.feeling_id).up()
            .e('id', post.id).up()
            .e('is_autopost', post.is_autopost).up()
            .e('is_community_private_autopost', '0').up()
            .e('is_spoiler', post.is_spoiler).up()
            .e('is_app_jumpable', post.is_app_jumpable).up()
            .e('empathy_count', (await query(`SELECT * FROM empathies WHERE post_id=${post.id}`)).length).up()
            .e('language_id', post.language_id).up()
            .e('mii', post.mii).up()
            .e('mii_face_url', post.mii_face_url).up()
            .e('number', '0').up();
            if (post.painting) {
                xml = xml.e('painting')
                .e('format', 'tga').up()
                .e('content', post.painting).up()
                .e('size', post.painting.length).up()
                .e('url', "https://s3.amazonaws.com/olv-public/pap/WVW69koebmETvBVqm1").up().up();
            }
            xml = xml.e('pid', post.pid).up()
            .e('platform_id', post.platform_id).up()
            .e('region_id', post.region_id).up()
            .e('reply_count', '0').up()
            .e('screen_name', post.screen_name).up()
            .e('title_id', JSON.parse(community.title_ids)[0]).up().up().up().up()
        }
        xml = xml.up().e('position', i + 1).up().up()
    }
    
    fs.writeFileSync('WWPTest.xml', xml.end({ pretty: true, allowEmpty: true }))

    res.set('Content-Type', 'application/xml')

    res.send(xml.end({pretty : true, allowEmpty : true}))
})

module.exports = router