module.exports = ({ env }) => ({
    plugins: {
        "postcss-preset-env": {
            features: {
                "nesting-rules": {  
                    noIsPseudoSelector: false,
                },
            },
        },
    },
});
