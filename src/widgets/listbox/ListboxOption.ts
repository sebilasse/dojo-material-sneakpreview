import { DNode,v,WidgetBase,ThemedBase,ThemedProperties,theme } from '../common/Widget';
import * as css from '../themes/redaktor-default/listbox.m.css';

export interface ListboxOptionProperties extends ThemedProperties {
	active?: boolean;
	//classes?: (string | null)[];
	disabled?: boolean;
	id: string;
	index: number;
	label: DNode;
	option: any;
	selected?: boolean;
	onClick?(option: any, index: number, key?: string | number): void;
}

@theme(css)
export class ListboxOptionBase<P extends ListboxOptionProperties = ListboxOptionProperties> extends ThemedBase<P, null> {
	private _onClick(event: MouseEvent) {
		event.stopPropagation();
		const { index, key, option, onClick } = this.properties;
		onClick && onClick(option, index, key);
	}

	protected render(): DNode {
		const {
			id,
			label,
			//classes = [],
			disabled = false,
			selected = false
		} = this.properties;

		return v('div', {
			'aria-disabled': disabled ? 'true' : null,
			'aria-selected': disabled ? null : String(selected),
			//classes: this.theme(classes),
			id,
			role: 'option',
			onclick: this._onClick
		}, [ label ]);
	}
}

export default class ListboxOption extends ListboxOptionBase<ListboxOptionProperties> {}
