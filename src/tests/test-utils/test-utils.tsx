import { ModelState, PartialModelState } from '../../main/components/store/model-state';
import { UMLDiagram } from '../../main/services/uml-diagram/uml-diagram';
import { ApollonMode } from '../../main';
import { ApollonView, EditorState } from '../../main/services/editor/editor-types';
import { IUMLElement } from '../../main/services/uml-element/uml-element';
import { UMLElementState } from '../../main/services/uml-element/uml-element-types';
import thunk, { ThunkDispatch } from 'redux-thunk';
import { Actions } from '../../main/services/actions';
import createMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import { Store } from 'redux';
import { createReduxStore } from '../../main/components/store/model-store';
import { ILayer } from '../../main/services/layouter/layer';
import { Point } from '../../main/utils/geometry/point';
import * as React from 'react';

export type DispatchExts = ThunkDispatch<ModelState, void, Actions>;

const middleware = [thunk];
const mockStore = createMockStore<ModelState, DispatchExts>(middleware);

const createModelStateFromPartialModelState = (
  partialModelState?: PartialModelState,
  elements?: IUMLElement[],
): ModelState => {
  const modelState: ModelState = {
    lastAction: partialModelState?.lastAction ? partialModelState.lastAction : '',
    assessments: partialModelState?.assessments ? { ...partialModelState.assessments } : {},
    connecting: partialModelState?.connecting ? partialModelState.connecting : [],
    copy: partialModelState?.copy ? partialModelState.copy : [],
    diagram: partialModelState?.diagram ? partialModelState.diagram : new UMLDiagram({}),
    interactive: partialModelState?.interactive ? partialModelState.interactive : [],
    moving: partialModelState?.moving ? partialModelState.moving : [],
    reconnecting: partialModelState?.reconnecting ? partialModelState.reconnecting : {},
    resizing: partialModelState?.resizing ? partialModelState.resizing : [],
    selected: partialModelState?.selected ? partialModelState.selected : [],
    updating: partialModelState?.updating ? partialModelState.updating : [],
    hovered: partialModelState?.hovered ? partialModelState.hovered : [],
    editor: {
      mode: partialModelState?.editor?.mode ? partialModelState.editor.mode : ApollonMode.Modelling,
      readonly: partialModelState?.editor?.readonly ? partialModelState.editor?.readonly : false,
      enablePopups: partialModelState?.editor?.enablePopups ? partialModelState.editor?.enablePopups : true,
      enableCopyPasteToClipboard: partialModelState?.editor?.enableCopyPasteToClipboard
        ? partialModelState.editor?.enableCopyPasteToClipboard
        : false,
      view: partialModelState?.editor?.view ? partialModelState.editor?.view : ApollonView.Modelling,
      features: {
        hoverable: true,
        selectable: true,
        movable: true,
        resizable: true,
        connectable: true,
        updatable: true,
        droppable: true,
      },
    } as EditorState,
    elements: elements
      ? elements.reduce<UMLElementState>(
          (elements, element) => ({
            ...elements,
            [element.id]: element,
          }),
          {},
        )
      : {},
  };
  return modelState;
};

/**
 * returns a mocked store, which does not execute reducers. It is made for test repositories only
 * @param modelState
 * @param elements
 */
export const getMockedStore = (
  modelState?: PartialModelState,
  elements?: IUMLElement[],
): MockStoreEnhanced<ModelState, DispatchExts> => {
  // initial state
  const storeState = createModelStateFromPartialModelState(modelState, elements);
  return mockStore(storeState);
};

const createSVG = (): SVGSVGElement => {
  const test = React.createElement<SVGSVGElement>('SVGSVGElement');
  return test.props;
};

/**
 * creates a real redux store from the partial modelState.
 * Reducers are executed and state changes can be checked
 * @param modelState partial model state
 * @param elements
 * @param layer
 */
export const getRealStore = (
  modelState?: PartialModelState,
  elements: IUMLElement[] = [],
  layer: ILayer = {
    layer: createSVG(),
    origin(): Point {
      return new Point(0, 0);
    },
  },
): Store<ModelState, any> => {
  const storeState = createModelStateFromPartialModelState(modelState, elements);
  return createReduxStore(storeState, layer);
};
