import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';

export default {
    input: 'src/index.js',
    external: ['chart.js'],
    output: [
        {
            file: 'dist/chartjs-chart-angles.js',
            format: 'umd',
            name: 'AnglesChart',
            globals: {
                'chart.js': 'Chart'
            }
        },
        {
            file: 'dist/chartjs-chart-angles.min.js',
            format: 'umd',
            name: 'AnglesChart',
            globals: {
                'chart.js': 'Chart'
            },
            plugins: [terser()]
        }
    ],
    plugins: [babel()]
};
