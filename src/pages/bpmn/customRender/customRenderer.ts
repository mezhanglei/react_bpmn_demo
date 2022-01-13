import inherits from 'inherits'
import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer'
import {
  isObject,
  assign,
  forEach
} from 'min-dash';
import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  remove as svgRemove,
  classes as svgClasses,
  select as svgSelect
} from 'tiny-svg';

import { is } from 'bpmn-js/lib/util/ModelUtil';
import { Label, Shape } from 'diagram-js/lib/model';


// 优先级
const HIGH_PRIORITY = 1500;

// 自定义画布上的节点的渲染效果
export default function CustomRenderer(eventBus, styles, bpmnRenderer, textRenderer, pathMap) {

  const computeStyle = styles.computeStyle;
  BaseRenderer.call(this, eventBus, HIGH_PRIORITY);

  // 添加label节点
  function renderLabel(parentGfx: SVGAElement, label: string, options: unknown) {

    options = assign({
      size: {
        width: 100
      }
    }, options);

    const text = textRenderer.createText(label || '', options);

    svgClasses(text).add('djs-label');

    svgAppend(parentGfx, text);

    return text;
  }

  // 自定义渲染器
  this.drawCustomElements = function (parentNode: SVGAElement, element: Shape | Label) {

    // 边框svg
    const shape = bpmnRenderer.drawShape(parentNode, element);

    // 开始节点
    if (is(element, 'bpmn:StartEvent')) {
      const customIcon = svgCreate('image', {
        x: 0,
        y: 0,
        width: 40,
        height: 40,
        href: 'https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/start.png'
      });
      // 添加渲染自定义图标
      svgAppend(parentNode, customIcon as SVGElement);
      svgRemove(shape);
    }

    // 结束节点
    // if (is(element, 'bpmn:EndEvent')) {
    //   const customIcon = svgCreate('image', {
    //     x: 0,
    //     y: 0,
    //     width: 40,
    //     height: 40,
    //     href: ''
    //   });
    //   // 添加渲染自定义图标
    //   svgAppend(parentNode, customIcon as SVGElement);
    //   svgRemove(shape);
    // }

    // 任务节点
    if (is(element, 'bpmn:Task')) {
      const newRect = svgCreate('rect', {
        width: 100,
        height: 80,
        rx: 2,
        ry: 2,
        stroke: '#52B415',
        strokeWidth: 2,
        fill: '#fff'
      });
      // svgAttr(newRect, {
      // });
      // svg添加到目标父节点下
      svgAppend(parentNode, newRect as SVGElement);
      // 绘画元素调整图层位置
      parentNode.insertBefore(newRect, parentNode.firstChild);
      svgRemove(shape);
      // 根据pathMap中的提供的默认一些path来绘画（测试）
      // const pathData = pathMap.getScaledPath('EVENT_MESSAGE', {
      //   xScaleFactor: 0.9,
      //   yScaleFactor: 0.9,
      //   containerWidth: element.width,
      //   containerHeight: element.height,
      //   position: {
      //     mx: 0.235,
      //     my: 0.315
      //   }
      // });
      // const path = svgCreate('path', {
      //   d: pathData,
      //   fill: "none",
      //   stroke: "black",
      //   strokeWidth: 1
      // });
      // svgAppend(parentNode, path);
    }

    // 互斥网关
    if (is(element, 'bpmn:ExclusiveGateway')) {

      renderLabel(parentNode, '分支', {
        ellipsis: true,
        align: 'center-middle',
        box: element,
        padding: 5,
        style: {
          fill: '#000',
          fontWeight: 'bold'
        }
      });
      const visualPathSvg = svgSelect(parentNode, 'path');
      // 移除分支中间的符号
      visualPathSvg && svgRemove(visualPathSvg)
    }

    return shape;
  }
}

// 继承
inherits(CustomRenderer, BaseRenderer);

CustomRenderer.$inject = ['eventBus', 'styles', 'bpmnRenderer', 'textRenderer', 'pathMap'];

// 自定义渲染的目标范围
CustomRenderer.prototype.canRender = function (element: unknown) {
  // 忽略label
  return !(element as Label).labelTarget;
}

// 自定义渲染器
CustomRenderer.prototype.drawShape = function (parentNode: SVGAElement, element: Shape | Label) {
  return this.drawCustomElements(parentNode, element)
};
