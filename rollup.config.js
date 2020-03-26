import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import pug from 'rollup-plugin-pug'

export default {
    input: 'main.js',
    output: {
        file: 'static/main.js',
        format: 'iife',
        name: 'bundle',
    },
    plugins: [
        pug(),
        resolve ( {
            main: true,
            browser: true
        } ),
        commonjs ()
    ]
}