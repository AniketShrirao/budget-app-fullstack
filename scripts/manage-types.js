import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const typesDir = path.join(srcDir, 'types');

// Add this function to detect circular dependencies
function detectCircularDependencies(dependencies) {
  const visited = new Set();
  const recursionStack = new Set();

  function hasCycle(node) {
    visited.add(node);
    recursionStack.add(node);

    const deps = dependencies.get(node) || new Set();
    for (const dep of deps) {
      if (!visited.has(dep)) {
        if (hasCycle(dep)) {
          console.warn(`Circular dependency detected: ${node} -> ${dep}`);
          return true;
        }
      } else if (recursionStack.has(dep)) {
        console.warn(`Circular dependency detected: ${node} -> ${dep}`);
        return true;
      }
    }

    recursionStack.delete(node);
    return false;
  }

  for (const [node] of dependencies) {
    if (!visited.has(node)) {
      if (hasCycle(node)) return true;
    }
  }
  return false;
}

// Enhanced dependency analysis
function analyzeDependencies(types) {
  const dependencies = new Map();
  
  types.forEach(type => {
    const name = type.name;
    const definition = type.definition;
    
    // Enhanced type reference patterns
    const patterns = [
      // Standard type references
      /(?<!export\s)(?<!interface\s)(?<!type\s)\b([A-Z]\w+)\b/g,
      // Generic type parameters
      /<([A-Z]\w+)>/g,
      // Array types
      /:\s*([A-Z]\w+)\[\]/g,
      // Union and intersection types
      /(?:\||&)\s*([A-Z]\w+)/g,
      // Property types
      /:\s*([A-Z]\w+)(?=[,;\s}])/g
    ];
    
    const typeRefs = new Set();
    patterns.forEach(pattern => {
      const matches = definition.match(pattern) || [];
      matches.forEach(match => {
        const typeName = match.replace(/[^a-zA-Z0-9]/g, '');
        if (typeName !== name) { // Avoid self-references
          typeRefs.add(typeName);
        }
      });
    });
    
    if (typeRefs.size > 0) {
      dependencies.set(name, typeRefs);
    }
  });
  
  // Check for circular dependencies
  if (detectCircularDependencies(dependencies)) {
    console.warn('⚠️ Circular dependencies detected in type definitions');
  }
  
  return dependencies;
}

// Add progress logging to extractTypes
async function extractTypes() {
  try {
    console.log('🔍 Starting type extraction...');
    await fs.mkdir(typesDir, { recursive: true });
    
    const typeFiles = {
      'transaction.ts': new Set(),
      'auth.ts': new Set(),
      'category.ts': new Set(),
      'common.ts': new Set()
    };
    
    console.log('📁 Scanning directory for TypeScript files...');
    const files = await walkDir(srcDir);
    console.log(`Found ${files.length} TypeScript files`);
    
    const allTypes = [];
    let processedFiles = 0;
    
    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = await fs.readFile(file, 'utf-8');
        const types = extractTypeDefinitions(content);
        allTypes.push(...types);
        processedFiles++;
        
        if (processedFiles % 10 === 0) {
          console.log(`⏳ Processed ${processedFiles}/${files.length} files...`);
        }
      }
    }
    
    console.log('🔄 Categorizing types and analyzing dependencies...');
    categorizeTypes(allTypes, typeFiles);
    const fileImports = generateTypeFileImports(allTypes, typeFiles);

    console.log('📝 Writing type definition files...');
    // Write type files with imports
    for (const [fileName, types] of Object.entries(typeFiles)) {
      if (types.size > 0) {
        const filePath = path.join(typesDir, fileName);
        const fileSpecificImports = fileImports.get(fileName);
        await fs.writeFile(filePath, generateTypeFile(types, fileSpecificImports));
      }
    }

    await generateIndexFile(typeFiles);
    await updateImports(files, typeFiles);

    console.log('✅ Types have been extracted and organized successfully!');
  } catch (error) {
    console.error('❌ Error processing types:', error);
  }
}

function extractTypeDefinitions(content) {
  const types = [];
  
  const typeRegex = /(?:export\s+)?(?:interface|type)\s+(\w+)(?:\s*=\s*[^;]+;|\s*{[^}]*})/g;
  content = content.replace(/export\s+type\s+for\s+\w+/g, '');
  
  let match;
  while ((match = typeRegex.exec(content)) !== null) {
    const definition = match[0];
    
    if (!definition.includes('{') && !definition.includes('=')) continue;
    
    const exportedDefinition = definition.startsWith('export') 
      ? definition 
      : `export ${definition}`;

    types.push({
      name: match[1],
      definition: exportedDefinition
    });
  }

  return types;
}

function cleanupTypeFile(content) {
  content = content.replace(/export\s+type\s+for\s+\w+\s*\n?/g, '');
  content = content.replace(/^\s*interface\s+\w+\s*{[^}]*}\s*$/gm, '');
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  return content;
}

function mergeCompatibleTypes(types) {
  const typeMap = new Map();

  types.forEach(type => {
    const match = type.definition.match(/(?:interface|type)\s+(\w+)\s*{([^}]*)}/);
    if (!match) return;

    const [, name, props] = match;
    const properties = props.split(';')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (!typeMap.has(name)) {
      typeMap.set(name, new Set(properties));
    } else {
      properties.forEach(prop => typeMap.get(name).add(prop));
    }
  });

  return Array.from(typeMap.entries()).map(([name, props]) => ({
    name,
    definition: `export interface ${name} {\n  ${Array.from(props).join(';\n  ')};\n}`
  }));
}

function generateTypeFileImports(types, typeFiles) {
  const fileImports = new Map();
  const dependencies = analyzeDependencies(types);
  
  const typeToFile = new Map();
  Object.entries(typeFiles).forEach(([file, typeSet]) => {
    Array.from(typeSet).forEach(type => {
      const match = type.match(/(?:interface|type)\s+(\w+)/);
      if (match) {
        typeToFile.set(match[1], file);
      }
    });
  });
  
  dependencies.forEach((deps, typeName) => {
    const sourceFile = typeToFile.get(typeName);
    if (!sourceFile) return;
    
    deps.forEach(dep => {
      const targetFile = typeToFile.get(dep);
      if (targetFile && targetFile !== sourceFile) {
        if (!fileImports.has(sourceFile)) {
          fileImports.set(sourceFile, new Map());
        }
        if (!fileImports.get(sourceFile).has(targetFile)) {
          fileImports.get(sourceFile).set(targetFile, new Set());
        }
        fileImports.get(sourceFile).get(targetFile).add(dep);
      }
    });
  });
  
  return fileImports;
}

function generateTypeFile(types, imports) {
  let content = '// Generated by manage-types script\n';
  
  if (imports) {
    const importStatements = Array.from(imports.entries()).map(([file, types]) => {
      const importTypes = Array.from(types).sort().join(', ');
      const relativePath = './' + path.basename(file, '.ts');
      return `import { ${importTypes} } from '${relativePath}';`;
    });
    
    if (importStatements.length > 0) {
      content += importStatements.join('\n') + '\n\n';
    }
  }
  
  content += Array.from(types).join('\n\n');
  return content;
}

function categorizeTypes(types, typeFiles) {
  const typeGroups = new Map();
  
  types.forEach(type => {
    if (!typeGroups.has(type.name)) {
      typeGroups.set(type.name, []);
    }
    typeGroups.get(type.name).push(type);
  });

  for (const [name, groupedTypes] of typeGroups) {
    const mergedTypes = mergeCompatibleTypes(groupedTypes);
    
    mergedTypes.forEach(type => {
      if (name.includes('Transaction')) {
        typeFiles['transaction.ts'].add(type.definition);
      } else if (name.includes('Auth')) {
        typeFiles['auth.ts'].add(type.definition);
      } else if (name.includes('Category')) {
        typeFiles['category.ts'].add(type.definition);
      } else {
        typeFiles['common.ts'].add(type.definition);
      }
    });
  }
}

function consolidateImports(content) {
  const importMap = new Map();
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const imports = match[1].split(',').map(i => i.trim());
    const source = match[2];
    
    if (!importMap.has(source)) {
      importMap.set(source, new Set());
    }
    imports.forEach(imp => importMap.get(source).add(imp));
  }

  content = content.replace(/import\s+{[^}]+}\s+from\s+['"][^'"]+['"];?\n?/g, '');

  const consolidatedImports = Array.from(importMap.entries())
    .map(([source, imports]) => {
      const uniqueImports = Array.from(imports)
        .filter(imp => imp !== '')
        .sort();
      return `import { ${uniqueImports.join(', ')} } from '${source}';`;
    })
    .join('\n');

  return consolidatedImports + '\n\n' + content.trim();
}

async function updateImports(files, typeFiles) {
  for (const file of files) {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = await fs.readFile(file, 'utf-8');
      content = content.replace(/import\s*{\s*for\s*}\s*from\s*['"][^'"]+['"];?\n?/g, '');
      let modified = false;

      for (const [typeFile, types] of Object.entries(typeFiles)) {
        for (const type of types) {
          const typeMatch = type.match(/(?:interface|type)\s+(\w+)/);
          if (!typeMatch) continue;
          
          const typeName = typeMatch[1];
          if (content.includes(`interface ${typeName}`) || content.includes(`type ${typeName}`)) {
            const relativePath = path.relative(path.dirname(file), typesDir)
              .replace(/\\/g, '/');
            const importStatement = `import { ${typeName} } from '${relativePath}/${path.basename(typeFile, '.ts')}';`;
            
            content = content.replace(
              new RegExp(`(export\\s+)?(interface|type)\\s+${typeName}\\s*{[^}]*}`, 'g'),
              ''
            );
            
            if (!content.includes(importStatement)) {
              content = importStatement + '\n' + content;
              modified = true;
            }
          }
        }
      }

      if (modified) {
        content = consolidateImports(content);
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        await fs.writeFile(file, content);
      }
    }
  }
}

async function walkDir(dir) {
  const files = await fs.readdir(dir);
  const allFiles = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      allFiles.push(...await walkDir(filePath));
    } else if (stat.isFile()) {
      allFiles.push(filePath);
    }
  }

  return allFiles;
}

async function generateIndexFile(typeFiles) {
  const exports = Object.keys(typeFiles)
    .filter(file => typeFiles[file].size > 0)
    .map(file => `export * from './${path.basename(file, '.ts')}';`)
    .join('\n');

  await fs.writeFile(
    path.join(typesDir, 'index.ts'),
    exports + '\n'
  );
}

extractTypes();