import {
	CustomAriaProperties, LabeledProperties, InputProperties, Input, Toggle,
	CheckboxRadioEventProperties, KeyEventProperties, PointerEventProperties
} from './common/interfaces';
import {
  DNode, v, w, RedaktorCSS, RedaktorWidgetBase, RedaktorProperties, theme, customElement
} from './common/Widget';
import { formatAriaProperties, Sizes } from './common/util';
import uuid from '../framework/uuid';
import Focus from '@dojo/framework/widget-core/meta/Focus';
import Icon from './icon/index';
import Label from './label/index';
import * as css from './themes/redaktor-default/checkbox.m.css';

export interface CheckProperties extends RedaktorProperties,
InputProperties, LabeledProperties, KeyEventProperties, PointerEventProperties,
CustomAriaProperties, CheckboxRadioEventProperties {
	offLabel?: DNode;
	checked?: boolean;
	value?: string;
}

export default class CheckBase<P extends CheckProperties = CheckProperties>
extends RedaktorWidgetBase<P> {
	protected _uuid = uuid();
	protected _type = 'checkbox';

	private _onFocus(event: FocusEvent) {
		this.properties.onFocus && this.properties.onFocus(event);
	}
	private _onBlur(event: FocusEvent) {
		this.properties.onBlur && this.properties.onBlur(event);
	}
	private _onMouseDown(event: MouseEvent) {
		event.stopPropagation();
		this.properties.onMouseDown && this.properties.onMouseDown(event);
	}
	private _toggleEvt(event: MouseEvent | Input): Toggle {
		this.readonlyProp('checked', (<HTMLInputElement>event.target).checked, event);
		this.readonlyProp('value', (<HTMLInputElement>event.target).value, event);
		return <Toggle>event
	}
	private _onClick(event: MouseEvent) {
		event.stopPropagation();
		this.properties.onClick && this.properties.onClick(this._toggleEvt(event));
	}
	private _onChange(event: Input) {
		event.stopPropagation();
		this.properties.onChange && this.properties.onChange(this._toggleEvt(event));
	}
	private _onMouseUp(event: MouseEvent) {
		event.stopPropagation();
		this.properties.onMouseUp && this.properties.onMouseUp(event);
	}
	private _onTouchStart(event: TouchEvent) {
		event.stopPropagation();
		this.properties.onTouchStart && this.properties.onTouchStart(event);
	}
	private _onTouchEnd(event: TouchEvent) {
		event.stopPropagation();
		this.properties.onTouchEnd && this.properties.onTouchEnd(event);
	}
	private _onTouchCancel(event: TouchEvent) {
		event.stopPropagation();
		this.properties.onTouchCancel && this.properties.onTouchCancel(event);
	}
  protected getEvtArgs(event: Event): any[] {
		return [(event.target as HTMLInputElement).checked]
	}

	protected getModifierClasses(): (string | null)[] {
		return [css.normal]
	}
	protected getInputClasses(): any[] {
		return [
      this.theme(css.input),
      ...this.getSchemaClasses(css)
    ];
	}
	protected getInnerClasses(): (string | null)[] {
		return []
	}
	protected _getRootClasses(ui: RedaktorCSS = css): (string | null)[] {
		const { checked = false, required } = this.properties;
		const focus = this.meta(Focus).get('root');
		return [
			ui.root,
			ui.wrapper,
			this.getDisabledClass(ui),
			this.getValidClass(ui),
			//...this.getSizeClasses(ui),
			checked ? ui.checked : null,
			focus.containsFocus ? ui.focused : null,
			required ? ui.required : null,
			...this.getModifierClasses()
		];
	}
	protected getRootClasses(): (string | null)[] { return this._getRootClasses() }
	protected getLabel(key: string = 'label'): DNode {
		const {
			widgetId = this._uuid, aria = {}, checked = false, size = 'default',
			disabled, invalid, label, offLabel, labelAfter = true, labelHidden, theme,
			name, readOnly, required, schema, value = `${this._value}`
		} = this.properties;
		const focus = this.meta(Focus).get('root');
		return w(Label, {
			key,
			size,
			theme,
			disabled,
			focused: focus.containsFocus,
			invalid,
			readOnly,
			required,
			hidden: labelHidden,
			forId: widgetId,
			muted: true
		}, [ key === 'label' ? label : offLabel ])
	}

	protected renderIcon(): DNode[] {
		return [w(Icon, { type: 'checkIcon', extraClasses: {root: css.checkIcon } })]
	}
	protected renderContent(): DNode[] { return this.renderIcon() }

	protected renderInput(): DNode {
		const {
			widgetId = this._uuid, aria = {}, checked = false, size = 'default',
			disabled, invalid, label, labelAfter = true, labelHidden, theme,
			name, readOnly, required, schema, value = `${this._value}`
		} = this.properties;
		return v('input', {
			id: widgetId,
			...formatAriaProperties(aria),
			classes: this.getInputClasses(),
			checked,
			disabled,
			'aria-invalid': invalid === true ? 'true' : null,
			name,
			readOnly,
			'aria-readonly': readOnly === true ? 'true' : null,
			required,
			value,
			type: this._type,
			onblur: this._onBlur,
			onchange: this._onChange,
			onclick: this._onClick,
			onfocus: this._onFocus,
			onmousedown: this._onMouseDown,
			onmouseup: this._onMouseUp,
			ontouchstart: this._onTouchStart,
			ontouchend: this._onTouchEnd,
			ontouchcancel: this._onTouchCancel
		})
	}
	protected renderInputWrapper(): DNode[] {
		return [
			this.renderInput(),
			v('div', {
				classes: [
					...this.getSchemaClasses(css),
					...this.getSizeClasses(),
					...this.getInnerClasses(),
					this.theme(css.inner)
				]
			}, this.renderContent())
		]
	}

	protected render(): DNode {
		const { label, offLabel, labelAfter = true } = this.properties;
		const children = [
			offLabel ? this.getLabel('offLabel') : null,
			...this.renderInputWrapper(),
			label ? this.getLabel() : null
		];

		return v('div', {
			key: 'root',
			classes: this.getRootClasses()
		}, labelAfter ? children : children.reverse());
	}
}
