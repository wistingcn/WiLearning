"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.avatarRouter = void 0;
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const Color = require('color');
exports.avatarRouter = express_1.default.Router();
exports.avatarRouter.get('/:text', (req, res) => {
    res.setHeader('Content-Type', 'image/svg+xml');
    const text = req.params.text.split('.')[0];
    const svg = generateGradient(text, 120, 120);
    res.status(200).send(svg);
});
function generateGradient(text, width, height) {
    const hash = crypto_1.default.createHash('md5').update(text).digest('hex');
    let firstColor = new Color(hashStringToColor(hash)).saturate(0.5);
    const lightning = firstColor.hsl().lightness();
    if (lightning < 25) {
        firstColor = firstColor.lighten(3);
    }
    if (lightning > 25 && lightning < 40) {
        firstColor = firstColor.lighten(0.8);
    }
    if (lightning > 75) {
        firstColor = firstColor.darken(0.4);
    }
    let svg = `
        <svg width="$WIDTH" height="$HEIGHT" viewBox="0 0 $WIDTH $HEIGHT" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <g>
                <defs>
                <linearGradient id="avatar" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="$FIRST"/>
                    <stop offset="100%" stop-color="$SECOND"/>
                </linearGradient>
                </defs>
                <rect fill="url(#avatar)" x="0" y="0" width="$WIDTH" height="$HEIGHT"/>
                <text x="50%" y="50%" alignment-baseline="central" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="$FONTSIZE">$TEXT</text>
            </g>
        </svg>
    `;
    let avatar = svg.replace('$FIRST', firstColor.hex());
    avatar = avatar.replace('$SECOND', getMatchingColor(firstColor).hex());
    avatar = avatar.replace(/(\$WIDTH)/g, width);
    avatar = avatar.replace(/(\$HEIGHT)/g, height);
    avatar = avatar.replace(/(\$TEXT)/g, text);
    avatar = avatar.replace(/(\$FONTSIZE)/g, String((height * 0.9) / text.length));
    return avatar;
}
function djb2(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) + hash + str.charCodeAt(i);
    }
    return hash;
}
function shouldChangeColor(color) {
    const rgb = color.rgb().array();
    const val = 765 - (rgb[0] + rgb[1] + rgb[2]);
    if (val < 250 || val > 700) {
        return true;
    }
    return false;
}
function hashStringToColor(str) {
    const hash = djb2(str);
    const r = (hash & 0xff0000) >> 16;
    const g = (hash & 0x00ff00) >> 8;
    const b = hash & 0x0000ff;
    return ('#' +
        ('0' + r.toString(16)).substr(-2) +
        ('0' + g.toString(16)).substr(-2) +
        ('0' + b.toString(16)).substr(-2));
}
function getMatchingColor(firstColor) {
    let color = firstColor;
    if (color.isDark()) {
        color = color.saturate(0.3).rotate(90);
    }
    else {
        color = color.desaturate(0.3).rotate(90);
    }
    if (shouldChangeColor(color)) {
        color = color.rotate(-200).saturate(0.5);
    }
    return color;
}
