import { assign } from 'min-dash';
import inherits from '@/utils/inherits';
import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import { Attributes } from 'diagram-js/lib/core/ElementFactory';
import { Base, Connection, Shape } from 'diagram-js/lib/model';

export default function CustomContextPadProvider(
  contextPad,
  modeling,
  elementFactory,
  create,
  autoPlace,
  elementRegistry,
  eventBus,
  translate,
  connect,
  canvas
) {
  this._modeling = modeling;
  this._elementFactory = elementFactory;
  this._create = create;
  this._autoPlace = autoPlace;
  this._elementRegistry = elementRegistry;
  this._eventBus = eventBus;
  this._translate = translate;
  this._connect = connect;
  this._canvas = canvas;

  contextPad.registerProvider(this);
}

inherits(CustomContextPadProvider, ContextPadProvider);

CustomContextPadProvider.$inject = [
  'contextPad',
  'modeling',
  'elementFactory',
  'create',
  'autoPlace',
  'elementRegistry',
  'eventBus',
  'translate',
  'connect',
  'canvas'
];

// 重写钩子函数
CustomContextPadProvider.prototype.getContextPadEntries = function (element) {
  const elementFactory = this._elementFactory;
  const elementRegistry = this._elementRegistry;
  const create = this._create;
  const autoPlace = this._autoPlace;
  const eventBus = this._eventBus;
  const canvas = this._canvas;
  const connect = this._connect;
  const translate = this._translate;
  const modeling = this._modeling;
  const actions = {};
  const { businessObject } = element;

  // 从该元素开始连接
  function startConnect(event, ele) {
    connect.start(event, ele);
  }

  // 移除该元素
  function removeElement() {
    modeling.removeElements([element]);
  }

  // 获取当前节点所在线路后面的所有指向节点
  const getNextElements = (ele: Shape) => {
    // 存储节点
    let cache = [];
    const outgoings = ele?.outgoing;
    for (let i = 0; i < outgoings?.length; i++) {
      const connection = outgoings[i];
      if (connection != null) {
        let queue = [];
        queue.unshift(connection);
        while (queue.length != 0) {
          const target: Base | undefined = queue.shift()?.target;
          if (target) {
            cache.push(target);
            const targetOutgoings: Connection[] | undefined = target?.outgoing;
            if (targetOutgoings) {
              for (let i = 0; i < targetOutgoings?.length; i++) {
                const connect: Connection = targetOutgoings[i];
                if (connect) {
                  queue.push(connect);
                }
              }
            }
          }
        }
      }
    }
    return cache;
  };

  // 上次创建的分支所连接的点
  const getRecent = (ele: any) => {
    const outgoings = ele?.outgoing;
    return outgoings?.[outgoings?.length - 1]?.target;
  }

  // // 获取除了根节点和起始点以外的所有节点
  // const getElements = () => {
  //   const elements = elementRegistry.filter(
  //     (item: any) => {
  //       const excludes = ["bpmn:Process", 'bpmn:SequenceFlow', 'bpmn:StartEvent'];
  //       return !excludes?.includes(item.type) && !excludes?.includes(item.labelTarget?.type);
  //     }
  //   );
  //   return elements;
  // };

  // 创建节点
  const createAction = (source: string, target: string, options?: Attributes) => {
    return function (event, ele) {
      const nextElements = getNextElements(element);
      const recent = getRecent(element);

      // 创建分支
      if (target === 'bpmn:ExclusiveGateway') {
        const taskType = 'bpmn:UserTask';
        const task1ShapeNode = elementFactory.createShape(assign({ type: taskType }, options));
        const task2ShapeNode = elementFactory.createShape(assign({ type: taskType }, options));
        const gatewayNode = elementFactory.createShape(assign({ type: target }, options));
        const deltaX = 200;
        // 渲染分支
        modeling.appendShape(element, gatewayNode, {
          x: element.x + element?.width / 2 + deltaX,
          y: element?.y + element?.height / 2
        });

        // 渲染两个节点
        const task1Shape = modeling.appendShape(gatewayNode, task1ShapeNode, {
          x: element.x + element?.width / 2 + deltaX * 2,
          y: element?.y + element?.height / 2
        });
        const task2Shape = autoPlace.append(gatewayNode, task2ShapeNode);
        modeling.moveElements(nextElements, { x: 450, y: 0 });
        modeling.connect(task1Shape, recent);
        modeling.connect(task2Shape, recent, {
          type: 'bpmn:SequenceFlow',
          // 前面表示起始点，后面表示指向结束点
          waypoints: [
            {
              original: {
                x: task2Shape.x + task2Shape.width / 2,
                y: task2Shape.y + task2Shape.height / 2
              },
              x: task2Shape.x,
              y: task2Shape.y
            },
            { x: recent.x - 50, y: task2Shape.y + task2Shape.height / 2 },
            { x: recent.x - 50, y: recent.y + recent.height / 2 },
            {
              original: {
                x: recent.x + recent.width / 2,
                y: recent.y + recent.height / 2
              },
              x: recent.x,
              y: recent.y
            }
          ]
        });
        modeling.removeElements(element.outgoing);

      } else { // 创建一个节点
        const taskShapeNode = elementFactory.createShape(assign({ type: target }, options));
        // 非插入元素或者给分支节点插入元素
        if (source === 'bpmn:ExclusiveGateway' || !nextElements?.length) {
          autoPlace.append(element, taskShapeNode);
        } else {
          // 插入元素设置距离
          const deltaX = 200;
          const taskShape = modeling.appendShape(
            element,
            taskShapeNode,
            {
              x: element.x + element?.width / 2 + deltaX,
              y: element?.y + element?.height / 2
            }
          );
          // 插入元素的最小间隔
          const minDistance = 150;
          // 轴心到元素的最小距离
          const minDeltaX = taskShape?.width / 2 + minDistance;
          // 轴心到元素的实际距离
          const halfDeltaX = (recent?.x - element?.x) / 2;
          // 需要移动距离
          const moveX = halfDeltaX > minDeltaX ? 0 : (minDeltaX - halfDeltaX) * 2;
          modeling.moveElements(nextElements, { x: moveX, y: 0 })
          // 重新连接
          modeling.connect(taskShape, recent);
          modeling.removeElements(element.outgoing);
        }
      }
    }
  }

  // 点击label节点
  if (element.type === 'label') {
    assign(actions, {});
  } else if (element.type !== 'label') {
    // 开始节点
    if (is(businessObject, 'bpmn:StartEvent')) {
      assign(actions, {
        'append.gateway': {
          group: 'model',
          className: 'bpmn-icon-gateway-xor',
          title: translate('Append ExclusiveGateway'),
          action: {
            click: createAction('bpmn:StartEvent', 'bpmn:ExclusiveGateway')
          }
        },
        'append.user-task': {
          group: 'model',
          className: 'bpmn-icon-user-task',
          title: translate('Append UserTask'),
          action: {
            click: createAction('bpmn:StartEvent', 'bpmn:UserTask')
          }
        }
      });
    }

    // 网关节点
    if (is(businessObject, 'bpmn:ExclusiveGateway')) {
      assign(actions, {
        'append.user-task': {
          group: 'model',
          className: 'bpmn-icon-user-task',
          title: translate('Append UserTask'),
          action: {
            click: createAction('bpmn:ExclusiveGateway', 'bpmn:UserTask')
          }
        }
      });
    }

    // 任务节点
    if (is(businessObject, 'bpmn:UserTask')) {
      assign(actions, {
        'append.gateway': {
          group: 'model',
          className: 'bpmn-icon-gateway-xor',
          title: translate('Append ExclusiveGateway'),
          action: {
            click: createAction('bpmn:UserTask', 'bpmn:ExclusiveGateway')
          },
        },
        'append.user-task': {
          group: 'model',
          className: 'bpmn-icon-user-task',
          title: translate('Append UserTask'),
          action: {
            click: createAction('bpmn:UserTask', 'bpmn:UserTask')
          }
        },
        'append.end-event': {
          group: 'model',
          className: 'bpmn-icon-end-event-none',
          title: translate('Append EndEvent'),
          action: {
            click: createAction('bpmn:UserTask', 'bpmn:EndEvent')
          }
        }
      });
    }

    // 非结束节点和非线条
    if (!is(businessObject, 'bpmn:EndEvent') && !is(businessObject, 'bpmn:SequenceFlow')) {
      assign(actions, {
        connect: {
          group: 'connect',
          className: 'bpmn-icon-connection-multi',
          title: translate('Append Sequence'),
          action: {
            click: startConnect
          },
        },
      });
    }

    // 所有节点都具有删除
    assign(actions, {
      delete: {
        group: 'edit',
        className: 'bpmn-icon-trash',
        title: translate('Remove'),
        action: {
          click: removeElement,
        },
      },
    });
  }
  return actions;
}
