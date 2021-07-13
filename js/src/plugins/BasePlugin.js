"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePlugin = void 0;
class BasePlugin {
    target;
    parser;
    constructor({ target, parser }) {
        this.target = target;
        this.parser = parser;
    }
    finishSuccess(object = {}) {
        this.emit(Object.assign(object, { type: "result_record", class: "done" }));
        this.emit({ type: 'sequencebreak' });
    }
    finishFailure(object = {}) {
        this.emit(Object.assign(object, { type: "result_record", class: "error" }));
        this.emit({ type: 'sequencebreak' });
    }
    /**
     *
     * @param object List of Object to be emiited.If array, a sequence break is automatically inserted
     */
    emit(object) {
        if (object instanceof Array) {
            object.forEach(o => this.emit(o));
            this.finishSuccess();
        }
        else if (!("type" in object))
            throw "plugin is allowed to emit only those objects which have a type property defined";
        else
            this.target.emit(object);
    }
}
exports.BasePlugin = BasePlugin;
//# sourceMappingURL=BasePlugin.js.map