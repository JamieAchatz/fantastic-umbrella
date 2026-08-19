import * as esbuild from 'esbuild';

import {sassPlugin} from 'esbuild-sass-plugin';

const nodeModulesDir = "../../../node_modules";
const color = false;
const plugins = [{"data":null,"name":"sass","buildConfigMapper":"(function (config) {\n    config.plugins.push(sassPlugin({\n        quietDeps: true\n    }));\n    return config;\n})\n"}];

function cleanLog(log) {
    return log.replace(/(?:\r\n|\r|\n)/g, '<br>').replace('[ERROR]', '').replace('[WARNING]', '');
}

function captureLogsPlugin() {
    return {
        name: 'capture-logs', setup(build) {
            build.onEnd(async result => {
                if (result.errors.length > 0) {
                    let formatted = await esbuild.formatMessages(result.errors, { kind: 'error', color, terminalWidth: 100 });
                    formatted.forEach((f) => console.log('[ERROR] ' + cleanLog(f)));
                }
                if (result.warnings.length > 0) {
                    let formatted = await esbuild.formatMessages(result.warnings, { kind: 'warning', color, terminalWidth: 100 });
                    formatted.forEach((f) => console.log('[WARN] ' + cleanLog(f)));
                }
            });
        }
    };
}

function applyPlugins(config) {
    let newConfig = config;
    newConfig.logLevel = 'silent';
    if (!newConfig.plugins) {
        newConfig.plugins = [captureLogsPlugin()];
    }
    for (const plugin of plugins) {
        console.log(`[DEBUG] Adding plugin ${plugin.name}`);
        try {
            const configurePlugin = eval(plugin.buildConfigMapper);
            newConfig = configurePlugin(config, plugin.data);
        } catch (err) {
            console.error(`[ERROR] Error while applying plugin ${plugin.name}:`, cleanLog(err.stack));
            process.exit(1);
        }
        console.log(`[DEBUG] ${plugin.name} plugin added`);
    }
    return newConfig;
}

async function build () {
    const options = {"bundle":true,"entryPoints":["/home/sarah/Desktop/Professional/Rafisa/RIO/text-editor/target/web-bundler/prod/app.js"],"minify":true,"loader":{".bmp":"file",".css":"css",".weba":"file",".module.css":"local-css",".bz":"file",".xls":"file",".mpeg":"file",".eot":"file",".oga":"file",".csv":"file",".pptx":"file",".bin":"file",".ppt":"file",".epub":"file",".pdf":"file",".woff2":"file",".mp3":"file",".txt":"text",".yaml":"file",".mp4":"file",".tiff":"file",".abw":"file",".mjs":"js",".tar":"file",".gz":"file",".cts":"ts",".rar":"file",".cda":"file",".ogx":"file",".3g2":"file",".otf":"file",".zip":"file",".ogv":"file",".mts":"ts",".jpeg":"file",".json":"json",".png":"file",".ts":"ts",".ico":"file",".tif":"file",".xul":"file",".jar":"file",".ics":"file",".xml":"file",".gif":"file",".aac":"file",".ods":"file",".jsonld":"file",".odt":"file",".xlsx":"file",".mid":"file",".vsd":"file",".opus":"file",".7z":"file",".mpkg":"file",".docx":"file",".odp":"file",".doc":"file",".html":"file",".rtf":"file",".svg":"file",".htm":"file",".jpg":"file",".azw":"file",".wav":"file",".cjs":"js",".ttf":"file",".avi":"file",".arc":"file",".midi":"file",".webp":"file",".avif":"file",".js":"js",".jsx":"jsx",".webm":"file",".woff":"file",".bz2":"file",".3gp":"file",".yml":"file",".tsx":"tsx",".xhtml":"file"},"preserveSymlinks":false,"outdir":"/home/sarah/Desktop/Professional/Rafisa/RIO/text-editor/target/web-bundler/prod/dist/static/bundle","sourcemap":true,"splitting":true,"define":{"LAUNCH_MODE":"'NORMAL'"},"format":"esm","entryNames":"[name]-[hash]","assetNames":"assets/[name]-[hash]","publicPath":"/static/bundle","external":["/static/*"]};
    console.log(`[DEBUG] Running EsBuild (${esbuild.version})`);
    try {
       await esbuild.build(applyPlugins(options));
        console.log("[DEBUG] Bundling completed successfully");
        esbuild.stop();
        process.exit(0);
    } catch(err) {
        if (!err.errors) {
            // We only print non bundling error, because bundling errors are already printed
            console.log("[ERROR] EsBuild Error: " + cleanLog(err.message));
        }
        esbuild.stop();
        process.exit(1);
    }
}

await build();

