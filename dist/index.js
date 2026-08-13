"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findToolsByAgent = exports.findToolsBySemantic = void 0;
exports.findTools = findTools;
const semantic_1 = require("./semantic");
const agent_1 = require("./agent");
var semantic_2 = require("./semantic");
Object.defineProperty(exports, "findToolsBySemantic", { enumerable: true, get: function () { return semantic_2.findToolsBySemantic; } });
var agent_2 = require("./agent");
Object.defineProperty(exports, "findToolsByAgent", { enumerable: true, get: function () { return agent_2.findToolsByAgent; } });
async function findTools(query, tools, strategy, options = {}) {
    if (!tools.length)
        return [];
    if (tools.length <= (options.maxTools ?? 8))
        return tools;
    switch (strategy) {
        case 'semantic':
            return (0, semantic_1.findToolsBySemantic)(query, tools, options);
        case 'agent':
            return (0, agent_1.findToolsByAgent)(query, tools, options);
        default:
            return tools;
    }
}
//# sourceMappingURL=index.js.map