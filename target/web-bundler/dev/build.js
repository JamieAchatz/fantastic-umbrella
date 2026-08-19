import * as esbuild from 'esbuild';

import {sassPlugin} from 'esbuild-sass-plugin';

const nodeModulesDir = "../../../node_modules";
const color = true;
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

const options = {"bundle":true,"entryPoints":["/home/sarah/Desktop/Professional/Rafisa/RIO/text-editor/target/web-bundler/dev/app.js"],"minify":false,"loader":{".bmp":"file",".css":"css",".weba":"file",".module.css":"local-css",".bz":"file",".xls":"file",".mpeg":"file",".eot":"file",".oga":"file",".csv":"file",".pptx":"file",".bin":"file",".ppt":"file",".epub":"file",".pdf":"file",".woff2":"file",".mp3":"file",".txt":"text",".yaml":"file",".mp4":"file",".tiff":"file",".abw":"file",".mjs":"js",".tar":"file",".gz":"file",".cts":"ts",".rar":"file",".cda":"file",".ogx":"file",".3g2":"file",".otf":"file",".zip":"file",".ogv":"file",".mts":"ts",".jpeg":"file",".json":"json",".png":"file",".ts":"ts",".ico":"file",".tif":"file",".xul":"file",".jar":"file",".ics":"file",".xml":"file",".gif":"file",".aac":"file",".ods":"file",".jsonld":"file",".odt":"file",".xlsx":"file",".mid":"file",".vsd":"file",".opus":"file",".7z":"file",".mpkg":"file",".docx":"file",".odp":"file",".doc":"file",".html":"file",".rtf":"file",".svg":"file",".htm":"file",".jpg":"file",".azw":"file",".wav":"file",".cjs":"js",".ttf":"file",".avi":"file",".arc":"file",".midi":"file",".webp":"file",".avif":"file",".js":"js",".jsx":"jsx",".webm":"file",".woff":"file",".bz2":"file",".3gp":"file",".yml":"file",".tsx":"tsx",".xhtml":"file"},"preserveSymlinks":true,"outdir":"/home/sarah/Desktop/Professional/Rafisa/RIO/text-editor/target/web-bundler/dev/dist/static/bundle","sourcemap":true,"splitting":true,"define":{"process.env.LIVE_RELOAD_PATH":"'/web-bundler/live'","LAUNCH_MODE":"'DEVELOPMENT'"},"format":"esm","entryNames":"[name]","assetNames":"assets/[name]-[hash]","publicPath":"/static/bundle","external":["/static/*"]};
let context = null;

async function build () {
    console.log("--BUILD--")
    console.debug(`[DEBUG] Running EsBuild (${esbuild.version})`);
    try {
        if (context == null) {
            context = await esbuild.context(applyPlugins(options));
        }
        await context.rebuild();
        console.log("[DEBUG] Bundling completed successfully");
        console.log("--BUILD-SUCCESS--");
    } catch (err) {
        if (!err.errors) {
            // We only print non bundling error, because bundling errors are already printed
            console.log("[ERROR] EsBuild Error: " + cleanLog(err.message));
        }
        console.log("--BUILD-ERROR--");
    }
}

async function close() {
    console.log('[DEBUG] Closing Esbuild Dev.');
    if (context) {
        await context.dispose();
        context = null;
        console.log('[DEBUG] Esbuild Dev closed.');
    }
    esbuild.stop();
    process.exit(0);
};

const decoder = new TextDecoder();
const reader = Deno.stdin.readable.getReader();

const handlers = {
  BUILD: async () => await build(),
  CLOSE: async () => await close()
};

async function listenForTriggers() {
  console.log("[DEBUG] Deno script is listening for Java events...");
  console.log("--READY--");
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const message = decoder.decode(value).trim();
      if (!message) continue;

      console.log("[DEBUG] Deno script request received:", message);

      const [trigger, ...rest] = message.split(" ");
      const payload = rest.join(" ");

      const handler = handlers[trigger.toUpperCase()];
      if (handler) {
        try {
          await handler(payload);
        } catch (err) {
          console.log(`[ERROR] Handler for ${trigger} failed:`, cleanLog(err.stack));
        }
      } else {
        console.error(`[ERROR] Unknown trigger: "${trigger}"`);
      }
    }
  } catch (err) {
    console.error("[ERROR] Error while reading stdin:", cleanLog(err.stack));
  } finally {
    reader.releaseLock();
    console.log("[INFO] Listener stopped.");
  }
}

await listenForTriggers();
