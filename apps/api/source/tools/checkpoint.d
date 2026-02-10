/**
 * Project Checkpoint Tool
 * Generates a deterministic hash of the project structure and dependencies.
 * Usage:
 *   dub run tools:checkpoint -- --generate            # Generate permanent license
 *   dub run tools:checkpoint -- --generate --days 30  # Generate 30-day license
 */
import std.stdio;
import std.file;
import std.path;
import std.string;
import std.process;
import std.conv;
import std.digest.sha;
import std.json;
import std.array;
import std.datetime;

void main(string[] args) {
    writeln("===========================================");
    writeln("   Simple E-Commerce Project Checkpoint");
    writeln("===========================================");

    // Determine Project Root using Environment (PWD) or fallback
    string pwd = environment.get("PWD", thisExePath().dirName());

    // Fix: If PWD ends with 'apps/api', go up 2 levels.
    string projectRoot;
    if (pwd.endsWith("apps/api")) {
        projectRoot = pwd[0..$-8]; // Remove "apps/api"
    } else {
        projectRoot = pwd;
    }

    writeln("Project Root: ", projectRoot);

    if (args.length > 1 && args[1] == "--generate") {
        generateContext(projectRoot);
        generateLicenseKey(projectRoot, args);
    } else {
        writeln("Usage: tools:checkpoint -- --generate [--days <n>]");
    }
}

void generateLicenseKey(string projectRoot, string[] args) {
    writeln("\n[1/2] Generating Hardware License Key...");

    string machineId = "";

    // Try to read machine-id
    try {
        if (exists("/etc/machine-id")) {
            machineId = readText("/etc/machine-id").strip();
        }
    } catch (Exception e) {
        // fallback
    }

    if (machineId.empty) {
        writeln("Warning: Could not read /etc/machine-id. Using hostname fallback.");
        machineId = environment.get("HOSTNAME", "unknown");
    }

    // Determine Duration
    bool isPermanent = true;
    long daysValid = 365; // Default 1 year for permanent feel
    string expiresAt = "2099-12-31"; // Far future

    // Check for --days flag
    foreach (arg; args) {
        if (arg.startsWith("--days=")) {
            try {
                daysValid = arg[7..$].to!long;
                isPermanent = false;
                auto expiryDate = Clock.currTime() + dur!"days"(daysValid);
                expiresAt = expiryDate.toISOExtString()[0..10];
                writeln("License Duration: ", daysValid, " days");
            } catch (Exception e) {
                writeln("Error parsing days: ", e.msg);
            }
        }
    }

    if (isPermanent) {
        writeln("License Type: PERMANENT (Development Mode)");
    } else {
        writeln("Expires On: ", expiresAt);
    }

    string salt = "SIMPLE-ECOMMERCE-2026-V1";
    string combined = machineId ~ salt;
    auto hash = sha256Of(combined);
    string hexHash = toHexString(hash).idup; // Make immutable string mutable for slicing

    // Format: XXXX-XXXX-XXXX-XXXX-DDDD (Add duration hash for uniqueness)
    string serial = format("%s-%s-%s-%s",
        hexHash[0..4],
        hexHash[4..8],
        hexHash[8..12],
        hexHash[12..16]
    );

    writeln("Machine ID: ", machineId);
    writeln("Generated Serial: ", serial);

    // Prompt to update .env
    writeln("\n[ACTION] Update apps/api/.env with the following lines:");
    writeln("LICENSE_KEY=", serial);
    writeln("LICENSE_EXPIRES=", expiresAt);
}

void generateContext(string projectRoot) {
    writeln("\n[2/2] Generating AI Context...");

    // Calculate Project Hash (Simplified)
    string[] fileList;
    auto projectFiles = dirEntries(projectRoot, SpanMode.depth);
    foreach (entry; projectFiles) {
        if (entry.isFile && (entry.name.endsWith(".d") || entry.name.endsWith(".ts") || entry.name.endsWith(".json"))) {
            fileList ~= entry.name;
        }
    }

    writeln("Found ", fileList.length, " source files.");

    // Create JSON Context
    JSONValue context;
    context["project"] = "Simple E-Commerce";
    context["version"] = "1.0.0";
    context["architecture"] = "DLang + Angular 17";
    context["status"] = "MVP in Progress";
    context["files_scanned"] = cast(int)fileList.length;

    // Write to docs/ref/ai-progress.json (Absolute path)
    string outputPath = buildPath(projectRoot, "docs/ref/ai-progress.json");
    writeln("Writing context to: ", outputPath);
    std.file.write(outputPath, context.toPrettyString());
}
