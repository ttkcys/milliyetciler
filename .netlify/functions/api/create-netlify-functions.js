const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src/app/api');
const destDir = path.join(__dirname, '.netlify/functions/api');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function copyRoute(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(dir, entry.name);
    const destPath = path.join(destDir, entry.name.replace('.ts', '.js'));

    if (entry.isDirectory()) {
      copyRoute(srcPath);
    } else if (entry.name === 'route.ts') {
      const content = fs.readFileSync(srcPath, 'utf8');
      const jsContent = content
        .replace(/export async function (\w+)\(req: NextRequest[^}]*\} \)/g, 'export async function $1(event)')
        .replace(/req\.json\(\)/g, 'event.body ? JSON.parse(event.body) : {}')
        .replace(/params\.id/g, 'event.pathParameters.id')
        .replace(/NextRequest/g, 'any')
        .replace(/NextResponse/g, 'Response');

      fs.writeFileSync(destPath.replace('.ts', '.js'), `
const { NextResponse } = require('next/server');
${jsContent}
exports.handler = async (event) => {
  const method = event.httpMethod;
  const fn = exports[method.toUpperCase()];
  if (fn) return fn(event);
  return { statusCode: 405 };
};
      `);
    }
  }
}

copyRoute(srcDir);