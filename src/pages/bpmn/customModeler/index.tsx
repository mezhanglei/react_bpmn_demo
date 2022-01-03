/* eslint-disable func-names */
/* eslint-disable no-underscore-dangle */
import Modeler from 'bpmn-js/lib/Modeler';
import inherits from '@/utils/inherits';
import 'bpmn-js/dist/assets/diagram-js.css'; // 节点栏样式
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import 'bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css';
import CustomPalette from '../customPalette';
import CustomTranslate from '../customTranslate';
import CustomContextPad from '../customContextPad';

export interface PropertiesPanel {

}

export type AdditionalModules = unknown[]

export interface Linting {

}

export interface ModdleExtensions {
    
}

export interface BpmnModelerOptions {
    container: string
    propertiesPanel: PropertiesPanel
    additionalModules: AdditionalModules
    linting: Linting
    moddleExtensions: ModdleExtensions
}

function CustomModeler(options: BpmnModelerOptions) {
    Modeler.call(this, options);
    this._customElements = [];
}

// 继承
inherits(CustomModeler, Modeler);

// 添加自定义模块
CustomModeler.prototype._modules = [].concat(CustomModeler.prototype._modules, [
    CustomPalette,
    CustomTranslate,
    CustomContextPad,
]);

CustomModeler.prototype.getCustomElements = function () {
    return this.customElements;
};

export default CustomModeler as unknown;
