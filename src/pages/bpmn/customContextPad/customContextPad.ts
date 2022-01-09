import { assign } from 'min-dash';
import inherits from '@/utils/inherits';
import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider';
import { is } from 'bpmn-js/lib/util/ModelUtil';

function CustomContextPadProvider(injector, connect, translate) {
  injector.invoke(ContextPadProvider, this);
  const elementFactory = this._elementFactory;
  const create = this._create;
  const autoPlace = this._autoPlace;
  const modeling = this._modeling;

  this.getContextPadEntries = function (element) {
    const actions = {};
    const { businessObject } = element;

    function startConnect(event, ele, autoActivate) {
      // ？？
      // console.log(autoActivate)
      connect.start(event, ele, autoActivate);
    }

    function removeElement() {
      modeling.removeElements([element]);
    }

    // 点击label节点
    if (element.type === 'label') {
      assign(actions, {});
    } else if (element.type !== 'label') {
      // 点击开始节点
      if (is(businessObject, 'bpmn:StartEvent')) {
        assign(actions, {
          'append.gateway': {
            group: 'model',
            className: 'bpmn-icon-gateway-xor',
            title: translate('Append ExclusiveGateway'),
            action: {
              click: (event, ele) => {
                console.log(event, ele)
              }
            }
          },
          'append.user-task': {
            group: 'model',
            className: 'bpmn-icon-user-task',
            title: translate('Append UserTask'),
            action: {
              click: (event, ele) => {
                console.log(event, ele)
              }
            }
          }
        });
      }

      // 点击网关
      if (is(businessObject, 'bpmn:ExclusiveGateway')) {
        assign(actions, {
          'append.user-task': {
            group: 'model',
            className: 'bpmn-icon-user-task',
            title: translate('Append UserTask'),
            action: {
            }
          }
        });
      }

      // 点击任务节点
      if (is(businessObject, 'bpmn:UserTask')) {
        assign(actions, {
          'append.gateway': {
            group: 'model',
            className: 'bpmn-icon-gateway-xor',
            title: translate('Append ExclusiveGateway'),
            action: {

            },
          },
          'append.user-task': {
            group: 'model',
            className: 'bpmn-icon-user-task',
            title: translate('Append UserTask'),
            action: {

            }
          },
          'append.end-event': {
            group: 'model',
            className: 'bpmn-icon-end-event-none',
            title: translate('Append EndEvent'),
            action: {

            }
          }
        });
      }

      // 非结束节点和条件节点
      if (!is(businessObject, 'bpmn:EndEvent') && !is(businessObject, 'bpmn:SequenceFlow')) {
        assign(actions, {
          connect: {
            group: 'connect',
            className: 'bpmn-icon-connection-multi',
            title: translate('Append Sequence'),
            action: {
              click: startConnect,
              dragstart: startConnect,
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
  };
}

inherits(CustomContextPadProvider, ContextPadProvider);
CustomContextPadProvider.$inject = ['injector', 'connect', 'translate', 'elementFactory'];
export default CustomContextPadProvider;
