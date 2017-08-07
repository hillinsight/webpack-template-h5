/**
 * @file PostCSS Config
 * @author lifayu(fyli@hillinsight.com)
 * @since 26/06/2017
 */
module.exports = ({file, options, env}) => ({
    parser: file.extname === '.sss' ? 'sugarss' : false,
    plugins: {
        'postcss-import': {
            root: file.dirname
        },
        'postcss-cssnext':  {
            browsers: ['last 4 versions', '> 5%']
        }
    }
});
