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
import customRendererModule from '../customRender';

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
    // container: DomElement // 渲染容器
	// width：string | number// 查看器宽度
	// height: string | number // 查看器高度
	// moddleExtensions： object// 需要用的扩展包
	// modules：<didi.Module>[]; // 自定义且需要覆盖默认扩展包的模块列表
	// additionalModules: <didi.Module>[]; // 自定义且与默认扩展包一起使用的模块列表
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
    customRendererModule
]);

CustomModeler.prototype.getCustomElements = function () {
    return this.customElements;
};

export default CustomModeler as unknown;
