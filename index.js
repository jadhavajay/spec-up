
module.exports = async (options = {}) => {

  const fs = require('fs-extra');
  const pkg = require('pkg-dir');

  function startModule(path, nowatch){
    require('child_process').fork(path + '/start.js', nowatch || options.nowatch ? ['nowatch'] : []);
  }

  async function copyFiles(path){
    return fs.copy(await pkg(__dirname) + '/spec-up', path).then(() => {
      console.log('--- Spec-Up files copied ---');
    }).catch(e => console.log(e));
  }

  try{
    let postinstall = process.env.npm_lifecycle_event === 'postinstall';
    let prefix = postinstall ? '../.' : '';
    let config = await fs.readJson(prefix + './specs.json');
    let resourcePath = prefix + `./${
      config.resource_path ? config.resource_path.trim().replace(/^\/|^[./]+/, '').replace(/\/$/g, '') + '/' : ''
    }spec-up`;
    if (postinstall || !(await fs.pathExists(resourcePath))) {
      await copyFiles(resourcePath);
      if (options.renderOnInstall) startModule(resourcePath, true);
    }
    if (!postinstall) startModule(resourcePath)
  }
  catch(e) {
    console.log(e);
  }

}