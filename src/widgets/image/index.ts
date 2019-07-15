import {
	RedaktorWidgetBase, RedaktorDimensions, v, w, theme, customElement, DNode
} from '../common/Widget';
import {
	RedaktorProperties, PointerEventProperties, KeyEventProperties, CustomAriaProperties
} from '../common/interfaces';
import { Intersection } from '@dojo/framework/widget-core/meta/Intersection';
import { Resize, ContentRect } from '@dojo/framework/widget-core/meta/Resize';
import * as css from '../themes/redaktor-default/card.m.css';
import * as uiCss from '../themes/redaktor-default/_ui.m.css';

export interface ImageProperties extends RedaktorProperties {
	src: string;
	srcset?: string;
	alt?: string;
	sizes?: string;
	baselined?: boolean;
	styles?: Partial<CSSStyleDeclaration>;
}

@customElement<ImageProperties>({
	tag: 'redaktor-image',
	properties: []
})
@theme(css)
class Image<P extends ImageProperties = ImageProperties> extends RedaktorWidgetBase<P> {
	private _boundIsLarger = this.isLarger.bind(this);
	private _w: number = 0.1;

	protected isLarger(contentRect: ContentRect) {
    const vw = Math.ceil((100 * contentRect.width) / window.innerWidth);
		const grew = vw > this._w;
		this._w = vw;
		return grew;
	}

	protected render(): DNode {
		const { src, srcset, alt, baselined = true, styles = {} } = this.properties;
		if (baselined) {
			styles.marginBottom = `${this.meta(RedaktorDimensions).getMargin('root')}px`
		}
		const { isIntersecting } = this.meta(Intersection).get('root');
		const { isLarger } = this.meta(Resize).get('root', { isLarger: this._boundIsLarger });
		//const recalc = srcset && !this.properties.sizes && isLarger;
		const { sizes = `${this._w}vw` } = this.properties;

console.log('render image', isIntersecting, isLarger);
/*
		if (recalc && isLarger) {
			console.log('isLarger', sizes)
		}
*/

		return v('img', {
			key: 'root',
			src,
			srcset,
			sizes,
			alt,
			styles
			/*,
			onload: (e:any) => { this._w = this.meta(RedaktorDimensions).get('root').offset.width }
			*/
			/*styles,
			onload: () => { this.invalidate() }*/

			/*
			classes: [
				this.theme(css.root),
					...this.getSchemaClasses(css),
					...this.getSizeClasses()
				]
			*/

		})
		// TODO actions :
		/*(
			<div key="root" classes={this.theme(css.root)}>
				{this.children}
				{actionsResult && <div classes={this.theme(css.actions)}>{actionsResult}</div>}
			</div>
		);*/
	}
}

export default Image;
