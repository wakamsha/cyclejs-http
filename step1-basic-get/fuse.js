const {FuseBox, Sparky} = require('fuse-box');

function setup() {
    const fuse = FuseBox.init({
        homeDir: './src/scripts',
        output: './public/$name.js',
        target: 'browser',
        sourceMaps: true,
        cache: false
    });
    const app = fuse.bundle('app').instructions(`> main.ts`);

    return [fuse, app];
}

Sparky.task('default', () => {
    const [fuse, app] = setup();
    app.watch();
    return fuse.run();
});
