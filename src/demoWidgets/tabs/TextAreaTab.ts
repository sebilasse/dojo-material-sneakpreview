import { v, w } from '@dojo/framework/widget-core/d';
import { WidgetBase } from '@dojo/framework/widget-core/WidgetBase';
import { TabProperties } from '../Tabs';
import Textarea from '../../widgets/text-area';
import { Size, MaterialSchema } from '../../widgets/common/util';
import * as css from '../../styles/tabs.m.css';

export default class TextAreaTab<P extends TabProperties = TabProperties> extends WidgetBase<P> {

	render() {
		const { size = 'default' } = this.properties;
		return v('div', { classes: css.root }, [
			v('h3', [ 'Text Areas' ]),
			v('div', [
				w(Textarea, {
					size,
					//responsive: true,
					//columns: 40,
					rows: 8,
					placeholder: 'Hello World',
					label: 'Text area'
				}),
				w(Textarea, {
					size,
					columns: 40,
					rows: 3,
					expand: true,
					schema: 'primary',
					placeholder: 'Hello World',
					label: 'Expanding primary text area'
				}),
				w(Textarea, {
					size,
					columns: 40,
					rows: 2,
					schema: 'primary',
					placeholder: 'Hello World',
					label: 'Primary text area'
				}),
				w(Textarea, {
					size,
					columns: 40,
					schema: 'secondary',
					placeholder: 'Hello World',
					label: 'Secondary text area'
				}),
				w(Textarea, {
					size,
					columns: 40,
					rows: 2,
					disabled: true,
					schema: 'primary',
					placeholder: 'Hello World',
					label: 'Disabled primary text area'
				}),
				v('p',['LOREM Sxy TEST']),
				w(Textarea, {
					size,
					columns: 40,
					disabled: true,
					rows: 4,
					value: 'Initial value',
					label: 'Disabled text area'
				}),
				v('p',['LOREM Sxy TEST']),
			])
		]);
	}
}