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

  // 创建节点和连线
  const createBranchByShape = () => {
    const rootElement = canvas.getRootElement()
    const createTaskShape = (x: number, y: number) => {
      // 创建节点
      let branchShape = elementFactory.createShape({
        type: "bpmn:UserTask"
      });
      branchShape.businessObject.name = "节点名称";
      // 节点渲染到画布
      return modeling.createShape(
        branchShape,
        {
          x: element.x + x,
          y: element.y + y
        },
        rootElement
      )
    }
    // let shape = elementRegistry.get(element.id)
    let taskShape1 = createTaskShape(150, 160)
    let taskShape2 = createTaskShape(150, -70)
    modeling.connect(element, taskShape1)
    modeling.connect(element, taskShape2)
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

  // 当前节点后面的节点最近距离
  const getRecent = (ele: any) => {
    const outgoings = ele?.outgoing;
    let min;
    let recent;
    for (let i = 0; i < outgoings?.length; i++) {
      const target = outgoings[i]?.target;
      const targetX = target?.x;
      const sourceX = ele?.x;
      // 排除后面节点在前面位置的情况
      if (targetX > sourceX) {
        if (min === undefined) {
          min = targetX - sourceX;
          recent = target;
        } else {
          if (targetX - sourceX < min) {
            min = targetX - sourceX;
            recent = target;
          }
        }
      }
    }
    return recent;
  }

  // 获取除了根节点和起始点以外的所有节点
  const getElements = () => {
    const elements = elementRegistry.filter(
      (item: any) => {
        const excludes = ["bpmn:Process", 'bpmn:SequenceFlow', 'bpmn:StartEvent'];
        return !excludes?.includes(item.type) && !excludes?.includes(item.labelTarget?.type);
      }
    );
    return elements;
  };

  // 创建节点
  const createAction = (source: string, target: string, options?: Attributes) => {
    return function (event, ele) {
      // 所有节点
      const elements = getElements();
      // 当前元素后面的所有节点
      const nextElements = getNextElements(element);
      // 当前元素后面最近的节点
      const recent = getRecent(element);
      // 创建一个节点
      const shape = elementFactory.createShape(assign({ type: target }, options));
      const rootElement = canvas.getRootElement();

      // 创建分支
      if (target === 'bpmn:ExclusiveGateway') {

      } else {
        
        // 插入元素操作
        if (nextElements?.length) {
          // 新元素设置距离
          const deltaX = 200;
          const taskShape = modeling.createShape(
            shape,
            {
              x: element.x + element?.width / 2 + deltaX,
              y: element?.y + element?.height / 2
            },
            rootElement
          );
          // 创建的最小间隔
          const minDistance = 150;
          // 新元素最小设置距离
          const minDeltaX = shape?.width / 2 + minDistance;
          // 新元素均分轴线的距离
          const halfDeltaX = (recent?.x - element?.x) / 2;
          // 需要移动距离
          const moveX = halfDeltaX > minDeltaX ? 0 : (minDeltaX - halfDeltaX) * 2;
          modeling.moveElements(nextElements, { x: moveX, y: 0 })
          // 重新连接
          modeling.connect(element, taskShape);
          modeling.connect(taskShape, recent);
          // 移除原链接
          modeling.removeElements(element?.outgoing);
        } else {
          // 新增元素操作
          autoPlace.append(element, shape);
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
            click: createBranchByShape
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
