import util from 'util';
import path from 'path';
import fs from 'fs';
import child_process, { execSync } from 'child_process';

// Utility function to execute a command
const exec = util.promisify(child_process.exec);
async function runCommand(command) {
  try {
    // Execute the command
    const { stdout, stderr } = await exec(command);
    console.log(stdout);
    console.error(stderr);
  } catch (error) {
    console.error(error);
  }
}

async function hasNPM() {
  try {
    // Check if npm is installed
    await exec('npm --version');
    return true;
  } catch (error) {
    return false;
  }
}

// Validate arguments

if (process.argv.length < 3) {
  console.error('Please provide the app name');
  console.log('Usage: create_app <app_name>');
  console.log('Example: npx create_app myapp');
  process.exit(1);
}

//Define constants
const ownPath = process.cwd(); // Current working directory
const folderName = process.argv[2]; // App name
const appPath = path.join(ownPath, folderName); // App path
const repo = ''; // Repo URL


// Check if the app path exists
try {
  fs.mkdirSync(appPath);
} catch (error) {
    if (error.code === 'EEXIST') {
        console.error('The app path already exists');
    } else {
        throw error;
    }
    process.exit(1);
}

// Set up the app

async function setup() {
    try {
        // Clone the repository
        console.log(`Cloning the repository from repo: ${repo}`);
        await runCommand(`git clone --depth1 ${repo} ${folderName}`).then(() => {
            console.log('✅ Repository cloned');
            console.log('');
        });

        // Change the current working directory
        process.chdir(appPath);

        // Check if npm is installed
        if (!await hasNPM()) {
            console.error('Please install npm');
            process.exit(1);
        }

        // Install the dependencies
        console.log('Installing dependencies');
        await runCommand('npm install').then(() => {
            console.log('✅ Dependencies installed');
            console.log('');
        });

        // Copy the .env.example file
        fs.copyFileSync(path.join(appPath, '.env.example'), path.join(appPath, '.env'));
        console.log('✅ .env file copied');

        // Delete .git folder
        await runCommand('npx rimraf ./.git').then(() => {
            console.log('✅ .git folder deleted');
            console.log('');
        });

        console.log('✅ Setup complete');

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}