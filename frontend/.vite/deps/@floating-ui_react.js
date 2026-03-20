import { i as __toESM, t as require_react } from "./react-qyqGnMJH.js";
import { t as require_jsx_runtime } from "./jsx-runtime-C5KNy9g2.js";
import { t as require_react_dom } from "./react-dom-DxhIy3fg.js";

//#region node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function hasWindow() {
	return typeof window !== "undefined";
}
function getNodeName(node) {
	if (isNode(node)) return (node.nodeName || "").toLowerCase();
	return "#document";
}
function getWindow(node) {
	var _node$ownerDocument;
	return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function getDocumentElement(node) {
	var _ref;
	return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
}
function isNode(value) {
	if (!hasWindow()) return false;
	return value instanceof Node || value instanceof getWindow(value).Node;
}
function isElement(value) {
	if (!hasWindow()) return false;
	return value instanceof Element || value instanceof getWindow(value).Element;
}
function isHTMLElement(value) {
	if (!hasWindow()) return false;
	return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
}
function isShadowRoot(value) {
	if (!hasWindow() || typeof ShadowRoot === "undefined") return false;
	return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
}
var invalidOverflowDisplayValues = /* @__PURE__ */ new Set(["inline", "contents"]);
function isOverflowElement(element) {
	const { overflow, overflowX, overflowY, display } = getComputedStyle$1(element);
	return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !invalidOverflowDisplayValues.has(display);
}
var tableElements = /* @__PURE__ */ new Set([
	"table",
	"td",
	"th"
]);
function isTableElement(element) {
	return tableElements.has(getNodeName(element));
}
var topLayerSelectors = [":popover-open", ":modal"];
function isTopLayer(element) {
	return topLayerSelectors.some((selector) => {
		try {
			return element.matches(selector);
		} catch (_e) {
			return false;
		}
	});
}
var transformProperties = [
	"transform",
	"translate",
	"scale",
	"rotate",
	"perspective"
];
var willChangeValues = [
	"transform",
	"translate",
	"scale",
	"rotate",
	"perspective",
	"filter"
];
var containValues = [
	"paint",
	"layout",
	"strict",
	"content"
];
function isContainingBlock(elementOrCss) {
	const webkit = isWebKit();
	const css = isElement(elementOrCss) ? getComputedStyle$1(elementOrCss) : elementOrCss;
	return transformProperties.some((value) => css[value] ? css[value] !== "none" : false) || (css.containerType ? css.containerType !== "normal" : false) || !webkit && (css.backdropFilter ? css.backdropFilter !== "none" : false) || !webkit && (css.filter ? css.filter !== "none" : false) || willChangeValues.some((value) => (css.willChange || "").includes(value)) || containValues.some((value) => (css.contain || "").includes(value));
}
function getContainingBlock(element) {
	let currentNode = getParentNode(element);
	while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
		if (isContainingBlock(currentNode)) return currentNode;
		else if (isTopLayer(currentNode)) return null;
		currentNode = getParentNode(currentNode);
	}
	return null;
}
function isWebKit() {
	if (typeof CSS === "undefined" || !CSS.supports) return false;
	return CSS.supports("-webkit-backdrop-filter", "none");
}
var lastTraversableNodeNames = /* @__PURE__ */ new Set([
	"html",
	"body",
	"#document"
]);
function isLastTraversableNode(node) {
	return lastTraversableNodeNames.has(getNodeName(node));
}
function getComputedStyle$1(element) {
	return getWindow(element).getComputedStyle(element);
}
function getNodeScroll(element) {
	if (isElement(element)) return {
		scrollLeft: element.scrollLeft,
		scrollTop: element.scrollTop
	};
	return {
		scrollLeft: element.scrollX,
		scrollTop: element.scrollY
	};
}
function getParentNode(node) {
	if (getNodeName(node) === "html") return node;
	const result = node.assignedSlot || node.parentNode || isShadowRoot(node) && node.host || getDocumentElement(node);
	return isShadowRoot(result) ? result.host : result;
}
function getNearestOverflowAncestor(node) {
	const parentNode = getParentNode(node);
	if (isLastTraversableNode(parentNode)) return node.ownerDocument ? node.ownerDocument.body : node.body;
	if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) return parentNode;
	return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(node, list, traverseIframes) {
	var _node$ownerDocument2;
	if (list === void 0) list = [];
	if (traverseIframes === void 0) traverseIframes = true;
	const scrollableAncestor = getNearestOverflowAncestor(node);
	const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
	const win = getWindow(scrollableAncestor);
	if (isBody) {
		const frameElement = getFrameElement(win);
		return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
	}
	return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
}
function getFrameElement(win) {
	return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
}

//#endregion
//#region node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
/**
* Custom positioning reference element.
* @see https://floating-ui.com/docs/virtual-elements
*/
var sides = [
	"top",
	"right",
	"bottom",
	"left"
];
var alignments = ["start", "end"];
var placements = /* @__PURE__ */ sides.reduce((acc, side) => acc.concat(side, side + "-" + alignments[0], side + "-" + alignments[1]), []);
var min = Math.min;
var max = Math.max;
var round = Math.round;
var floor = Math.floor;
var createCoords = (v) => ({
	x: v,
	y: v
});
var oppositeSideMap = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
var oppositeAlignmentMap = {
	start: "end",
	end: "start"
};
function clamp(start, value, end) {
	return max(start, min(value, end));
}
function evaluate(value, param) {
	return typeof value === "function" ? value(param) : value;
}
function getSide(placement) {
	return placement.split("-")[0];
}
function getAlignment(placement) {
	return placement.split("-")[1];
}
function getOppositeAxis(axis) {
	return axis === "x" ? "y" : "x";
}
function getAxisLength(axis) {
	return axis === "y" ? "height" : "width";
}
var yAxisSides = /* @__PURE__ */ new Set(["top", "bottom"]);
function getSideAxis(placement) {
	return yAxisSides.has(getSide(placement)) ? "y" : "x";
}
function getAlignmentAxis(placement) {
	return getOppositeAxis(getSideAxis(placement));
}
function getAlignmentSides(placement, rects, rtl) {
	if (rtl === void 0) rtl = false;
	const alignment = getAlignment(placement);
	const alignmentAxis = getAlignmentAxis(placement);
	const length = getAxisLength(alignmentAxis);
	let mainAlignmentSide = alignmentAxis === "x" ? alignment === (rtl ? "end" : "start") ? "right" : "left" : alignment === "start" ? "bottom" : "top";
	if (rects.reference[length] > rects.floating[length]) mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
	return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
}
function getExpandedPlacements(placement) {
	const oppositePlacement = getOppositePlacement(placement);
	return [
		getOppositeAlignmentPlacement(placement),
		oppositePlacement,
		getOppositeAlignmentPlacement(oppositePlacement)
	];
}
function getOppositeAlignmentPlacement(placement) {
	return placement.replace(/start|end/g, (alignment) => oppositeAlignmentMap[alignment]);
}
var lrPlacement = ["left", "right"];
var rlPlacement = ["right", "left"];
var tbPlacement = ["top", "bottom"];
var btPlacement = ["bottom", "top"];
function getSideList(side, isStart, rtl) {
	switch (side) {
		case "top":
		case "bottom":
			if (rtl) return isStart ? rlPlacement : lrPlacement;
			return isStart ? lrPlacement : rlPlacement;
		case "left":
		case "right": return isStart ? tbPlacement : btPlacement;
		default: return [];
	}
}
function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
	const alignment = getAlignment(placement);
	let list = getSideList(getSide(placement), direction === "start", rtl);
	if (alignment) {
		list = list.map((side) => side + "-" + alignment);
		if (flipAlignment) list = list.concat(list.map(getOppositeAlignmentPlacement));
	}
	return list;
}
function getOppositePlacement(placement) {
	return placement.replace(/left|right|bottom|top/g, (side) => oppositeSideMap[side]);
}
function expandPaddingObject(padding) {
	return {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...padding
	};
}
function getPaddingObject(padding) {
	return typeof padding !== "number" ? expandPaddingObject(padding) : {
		top: padding,
		right: padding,
		bottom: padding,
		left: padding
	};
}
function rectToClientRect(rect) {
	const { x, y, width, height } = rect;
	return {
		width,
		height,
		top: y,
		left: x,
		right: x + width,
		bottom: y + height,
		x,
		y
	};
}

//#endregion
//#region node_modules/tabbable/dist/index.esm.js
var candidateSelectors = [
	"input:not([inert]):not([inert] *)",
	"select:not([inert]):not([inert] *)",
	"textarea:not([inert]):not([inert] *)",
	"a[href]:not([inert]):not([inert] *)",
	"button:not([inert]):not([inert] *)",
	"[tabindex]:not(slot):not([inert]):not([inert] *)",
	"audio[controls]:not([inert]):not([inert] *)",
	"video[controls]:not([inert]):not([inert] *)",
	"[contenteditable]:not([contenteditable=\"false\"]):not([inert]):not([inert] *)",
	"details>summary:first-of-type:not([inert]):not([inert] *)",
	"details:not([inert]):not([inert] *)"
];
var candidateSelector = /* @__PURE__ */ candidateSelectors.join(",");
var NoElement = typeof Element === "undefined";
var matches = NoElement ? function() {} : Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
var getRootNode = !NoElement && Element.prototype.getRootNode ? function(element) {
	var _element$getRootNode;
	return element === null || element === void 0 ? void 0 : (_element$getRootNode = element.getRootNode) === null || _element$getRootNode === void 0 ? void 0 : _element$getRootNode.call(element);
} : function(element) {
	return element === null || element === void 0 ? void 0 : element.ownerDocument;
};
/**
* Determines if a node is inert or in an inert ancestor.
* @param {Node} [node]
* @param {boolean} [lookUp] If true and `node` is not inert, looks up at ancestors to
*  see if any of them are inert. If false, only `node` itself is considered.
* @returns {boolean} True if inert itself or by way of being in an inert ancestor.
*  False if `node` is falsy.
*/
var _isInert = function isInert(node, lookUp) {
	var _node$getAttribute;
	if (lookUp === void 0) lookUp = true;
	var inertAtt = node === null || node === void 0 ? void 0 : (_node$getAttribute = node.getAttribute) === null || _node$getAttribute === void 0 ? void 0 : _node$getAttribute.call(node, "inert");
	return inertAtt === "" || inertAtt === "true" || lookUp && node && (typeof node.closest === "function" ? node.closest("[inert]") : _isInert(node.parentNode));
};
/**
* Determines if a node's content is editable.
* @param {Element} [node]
* @returns True if it's content-editable; false if it's not or `node` is falsy.
*/
var isContentEditable = function isContentEditable(node) {
	var _node$getAttribute2;
	var attValue = node === null || node === void 0 ? void 0 : (_node$getAttribute2 = node.getAttribute) === null || _node$getAttribute2 === void 0 ? void 0 : _node$getAttribute2.call(node, "contenteditable");
	return attValue === "" || attValue === "true";
};
/**
* @param {Element} el container to check in
* @param {boolean} includeContainer add container to check
* @param {(node: Element) => boolean} filter filter candidates
* @returns {Element[]}
*/
var getCandidates = function getCandidates(el, includeContainer, filter) {
	if (_isInert(el)) return [];
	var candidates = Array.prototype.slice.apply(el.querySelectorAll(candidateSelector));
	if (includeContainer && matches.call(el, candidateSelector)) candidates.unshift(el);
	candidates = candidates.filter(filter);
	return candidates;
};
/**
* @callback GetShadowRoot
* @param {Element} element to check for shadow root
* @returns {ShadowRoot|boolean} ShadowRoot if available or boolean indicating if a shadowRoot is attached but not available.
*/
/**
* @callback ShadowRootFilter
* @param {Element} shadowHostNode the element which contains shadow content
* @returns {boolean} true if a shadow root could potentially contain valid candidates.
*/
/**
* @typedef {Object} CandidateScope
* @property {Element} scopeParent contains inner candidates
* @property {Element[]} candidates list of candidates found in the scope parent
*/
/**
* @typedef {Object} IterativeOptions
* @property {GetShadowRoot|boolean} getShadowRoot true if shadow support is enabled; falsy if not;
*  if a function, implies shadow support is enabled and either returns the shadow root of an element
*  or a boolean stating if it has an undisclosed shadow root
* @property {(node: Element) => boolean} filter filter candidates
* @property {boolean} flatten if true then result will flatten any CandidateScope into the returned list
* @property {ShadowRootFilter} shadowRootFilter filter shadow roots;
*/
/**
* @param {Element[]} elements list of element containers to match candidates from
* @param {boolean} includeContainer add container list to check
* @param {IterativeOptions} options
* @returns {Array.<Element|CandidateScope>}
*/
var _getCandidatesIteratively = function getCandidatesIteratively(elements, includeContainer, options) {
	var candidates = [];
	var elementsToCheck = Array.from(elements);
	while (elementsToCheck.length) {
		var element = elementsToCheck.shift();
		if (_isInert(element, false)) continue;
		if (element.tagName === "SLOT") {
			var assigned = element.assignedElements();
			var nestedCandidates = _getCandidatesIteratively(assigned.length ? assigned : element.children, true, options);
			if (options.flatten) candidates.push.apply(candidates, nestedCandidates);
			else candidates.push({
				scopeParent: element,
				candidates: nestedCandidates
			});
		} else {
			if (matches.call(element, candidateSelector) && options.filter(element) && (includeContainer || !elements.includes(element))) candidates.push(element);
			var shadowRoot = element.shadowRoot || typeof options.getShadowRoot === "function" && options.getShadowRoot(element);
			var validShadowRoot = !_isInert(shadowRoot, false) && (!options.shadowRootFilter || options.shadowRootFilter(element));
			if (shadowRoot && validShadowRoot) {
				var _nestedCandidates = _getCandidatesIteratively(shadowRoot === true ? element.children : shadowRoot.children, true, options);
				if (options.flatten) candidates.push.apply(candidates, _nestedCandidates);
				else candidates.push({
					scopeParent: element,
					candidates: _nestedCandidates
				});
			} else elementsToCheck.unshift.apply(elementsToCheck, element.children);
		}
	}
	return candidates;
};
/**
* @private
* Determines if the node has an explicitly specified `tabindex` attribute.
* @param {HTMLElement} node
* @returns {boolean} True if so; false if not.
*/
var hasTabIndex = function hasTabIndex(node) {
	return !isNaN(parseInt(node.getAttribute("tabindex"), 10));
};
/**
* Determine the tab index of a given node.
* @param {HTMLElement} node
* @returns {number} Tab order (negative, 0, or positive number).
* @throws {Error} If `node` is falsy.
*/
var getTabIndex = function getTabIndex(node) {
	if (!node) throw new Error("No node provided");
	if (node.tabIndex < 0) {
		if ((/^(AUDIO|VIDEO|DETAILS)$/.test(node.tagName) || isContentEditable(node)) && !hasTabIndex(node)) return 0;
	}
	return node.tabIndex;
};
/**
* Determine the tab index of a given node __for sort order purposes__.
* @param {HTMLElement} node
* @param {boolean} [isScope] True for a custom element with shadow root or slot that, by default,
*  has tabIndex -1, but needs to be sorted by document order in order for its content to be
*  inserted into the correct sort position.
* @returns {number} Tab order (negative, 0, or positive number).
*/
var getSortOrderTabIndex = function getSortOrderTabIndex(node, isScope) {
	var tabIndex = getTabIndex(node);
	if (tabIndex < 0 && isScope && !hasTabIndex(node)) return 0;
	return tabIndex;
};
var sortOrderedTabbables = function sortOrderedTabbables(a, b) {
	return a.tabIndex === b.tabIndex ? a.documentOrder - b.documentOrder : a.tabIndex - b.tabIndex;
};
var isInput = function isInput(node) {
	return node.tagName === "INPUT";
};
var isHiddenInput = function isHiddenInput(node) {
	return isInput(node) && node.type === "hidden";
};
var isDetailsWithSummary = function isDetailsWithSummary(node) {
	return node.tagName === "DETAILS" && Array.prototype.slice.apply(node.children).some(function(child) {
		return child.tagName === "SUMMARY";
	});
};
var getCheckedRadio = function getCheckedRadio(nodes, form) {
	for (var i = 0; i < nodes.length; i++) if (nodes[i].checked && nodes[i].form === form) return nodes[i];
};
var isTabbableRadio = function isTabbableRadio(node) {
	if (!node.name) return true;
	var radioScope = node.form || getRootNode(node);
	var queryRadios = function queryRadios(name) {
		return radioScope.querySelectorAll("input[type=\"radio\"][name=\"" + name + "\"]");
	};
	var radioSet;
	if (typeof window !== "undefined" && typeof window.CSS !== "undefined" && typeof window.CSS.escape === "function") radioSet = queryRadios(window.CSS.escape(node.name));
	else try {
		radioSet = queryRadios(node.name);
	} catch (err) {
		console.error("Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s", err.message);
		return false;
	}
	var checked = getCheckedRadio(radioSet, node.form);
	return !checked || checked === node;
};
var isRadio = function isRadio(node) {
	return isInput(node) && node.type === "radio";
};
var isNonTabbableRadio = function isNonTabbableRadio(node) {
	return isRadio(node) && !isTabbableRadio(node);
};
var isNodeAttached = function isNodeAttached(node) {
	var _nodeRoot;
	var nodeRoot = node && getRootNode(node);
	var nodeRootHost = (_nodeRoot = nodeRoot) === null || _nodeRoot === void 0 ? void 0 : _nodeRoot.host;
	var attached = false;
	if (nodeRoot && nodeRoot !== node) {
		var _nodeRootHost, _nodeRootHost$ownerDo, _node$ownerDocument;
		attached = !!((_nodeRootHost = nodeRootHost) !== null && _nodeRootHost !== void 0 && (_nodeRootHost$ownerDo = _nodeRootHost.ownerDocument) !== null && _nodeRootHost$ownerDo !== void 0 && _nodeRootHost$ownerDo.contains(nodeRootHost) || node !== null && node !== void 0 && (_node$ownerDocument = node.ownerDocument) !== null && _node$ownerDocument !== void 0 && _node$ownerDocument.contains(node));
		while (!attached && nodeRootHost) {
			var _nodeRoot2, _nodeRootHost2, _nodeRootHost2$ownerD;
			nodeRoot = getRootNode(nodeRootHost);
			nodeRootHost = (_nodeRoot2 = nodeRoot) === null || _nodeRoot2 === void 0 ? void 0 : _nodeRoot2.host;
			attached = !!((_nodeRootHost2 = nodeRootHost) !== null && _nodeRootHost2 !== void 0 && (_nodeRootHost2$ownerD = _nodeRootHost2.ownerDocument) !== null && _nodeRootHost2$ownerD !== void 0 && _nodeRootHost2$ownerD.contains(nodeRootHost));
		}
	}
	return attached;
};
var isZeroArea = function isZeroArea(node) {
	var _node$getBoundingClie = node.getBoundingClientRect(), width = _node$getBoundingClie.width, height = _node$getBoundingClie.height;
	return width === 0 && height === 0;
};
var isHidden = function isHidden(node, _ref) {
	var displayCheck = _ref.displayCheck, getShadowRoot = _ref.getShadowRoot;
	if (displayCheck === "full-native") {
		if ("checkVisibility" in node) return !node.checkVisibility({
			checkOpacity: false,
			opacityProperty: false,
			contentVisibilityAuto: true,
			visibilityProperty: true,
			checkVisibilityCSS: true
		});
	}
	if (getComputedStyle(node).visibility === "hidden") return true;
	var nodeUnderDetails = matches.call(node, "details>summary:first-of-type") ? node.parentElement : node;
	if (matches.call(nodeUnderDetails, "details:not([open]) *")) return true;
	if (!displayCheck || displayCheck === "full" || displayCheck === "full-native" || displayCheck === "legacy-full") {
		if (typeof getShadowRoot === "function") {
			var originalNode = node;
			while (node) {
				var parentElement = node.parentElement;
				var rootNode = getRootNode(node);
				if (parentElement && !parentElement.shadowRoot && getShadowRoot(parentElement) === true) return isZeroArea(node);
				else if (node.assignedSlot) node = node.assignedSlot;
				else if (!parentElement && rootNode !== node.ownerDocument) node = rootNode.host;
				else node = parentElement;
			}
			node = originalNode;
		}
		if (isNodeAttached(node)) return !node.getClientRects().length;
		if (displayCheck !== "legacy-full") return true;
	} else if (displayCheck === "non-zero-area") return isZeroArea(node);
	return false;
};
var isDisabledFromFieldset = function isDisabledFromFieldset(node) {
	if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(node.tagName)) {
		var parentNode = node.parentElement;
		while (parentNode) {
			if (parentNode.tagName === "FIELDSET" && parentNode.disabled) {
				for (var i = 0; i < parentNode.children.length; i++) {
					var child = parentNode.children.item(i);
					if (child.tagName === "LEGEND") return matches.call(parentNode, "fieldset[disabled] *") ? true : !child.contains(node);
				}
				return true;
			}
			parentNode = parentNode.parentElement;
		}
	}
	return false;
};
var isNodeMatchingSelectorFocusable = function isNodeMatchingSelectorFocusable(options, node) {
	if (node.disabled || isHiddenInput(node) || isHidden(node, options) || isDetailsWithSummary(node) || isDisabledFromFieldset(node)) return false;
	return true;
};
var isNodeMatchingSelectorTabbable = function isNodeMatchingSelectorTabbable(options, node) {
	if (isNonTabbableRadio(node) || getTabIndex(node) < 0 || !isNodeMatchingSelectorFocusable(options, node)) return false;
	return true;
};
var isShadowRootTabbable = function isShadowRootTabbable(shadowHostNode) {
	var tabIndex = parseInt(shadowHostNode.getAttribute("tabindex"), 10);
	if (isNaN(tabIndex) || tabIndex >= 0) return true;
	return false;
};
/**
* @param {Array.<Element|CandidateScope>} candidates
* @returns Element[]
*/
var _sortByOrder = function sortByOrder(candidates) {
	var regularTabbables = [];
	var orderedTabbables = [];
	candidates.forEach(function(item, i) {
		var isScope = !!item.scopeParent;
		var element = isScope ? item.scopeParent : item;
		var candidateTabindex = getSortOrderTabIndex(element, isScope);
		var elements = isScope ? _sortByOrder(item.candidates) : element;
		if (candidateTabindex === 0) isScope ? regularTabbables.push.apply(regularTabbables, elements) : regularTabbables.push(element);
		else orderedTabbables.push({
			documentOrder: i,
			tabIndex: candidateTabindex,
			item,
			isScope,
			content: elements
		});
	});
	return orderedTabbables.sort(sortOrderedTabbables).reduce(function(acc, sortable) {
		sortable.isScope ? acc.push.apply(acc, sortable.content) : acc.push(sortable.content);
		return acc;
	}, []).concat(regularTabbables);
};
var tabbable = function tabbable(container, options) {
	options = options || {};
	var candidates;
	if (options.getShadowRoot) candidates = _getCandidatesIteratively([container], options.includeContainer, {
		filter: isNodeMatchingSelectorTabbable.bind(null, options),
		flatten: false,
		getShadowRoot: options.getShadowRoot,
		shadowRootFilter: isShadowRootTabbable
	});
	else candidates = getCandidates(container, options.includeContainer, isNodeMatchingSelectorTabbable.bind(null, options));
	return _sortByOrder(candidates);
};
var focusable = function focusable(container, options) {
	options = options || {};
	var candidates;
	if (options.getShadowRoot) candidates = _getCandidatesIteratively([container], options.includeContainer, {
		filter: isNodeMatchingSelectorFocusable.bind(null, options),
		flatten: true,
		getShadowRoot: options.getShadowRoot
	});
	else candidates = getCandidates(container, options.includeContainer, isNodeMatchingSelectorFocusable.bind(null, options));
	return candidates;
};
var isTabbable = function isTabbable(node, options) {
	options = options || {};
	if (!node) throw new Error("No node provided");
	if (matches.call(node, candidateSelector) === false) return false;
	return isNodeMatchingSelectorTabbable(options, node);
};

//#endregion
//#region node_modules/@floating-ui/react/dist/floating-ui.react.utils.mjs
function getPlatform() {
	const uaData = navigator.userAgentData;
	if (uaData != null && uaData.platform) return uaData.platform;
	return navigator.platform;
}
function getUserAgent() {
	const uaData = navigator.userAgentData;
	if (uaData && Array.isArray(uaData.brands)) return uaData.brands.map((_ref) => {
		let { brand, version } = _ref;
		return brand + "/" + version;
	}).join(" ");
	return navigator.userAgent;
}
function isSafari() {
	return /apple/i.test(navigator.vendor);
}
function isAndroid() {
	const re = /android/i;
	return re.test(getPlatform()) || re.test(getUserAgent());
}
function isMac() {
	return getPlatform().toLowerCase().startsWith("mac") && !navigator.maxTouchPoints;
}
function isJSDOM() {
	return getUserAgent().includes("jsdom/");
}
var FOCUSABLE_ATTRIBUTE$1 = "data-floating-ui-focusable";
var TYPEABLE_SELECTOR = "input:not([type='hidden']):not([disabled]),[contenteditable]:not([contenteditable='false']),textarea:not([disabled])";
var ARROW_LEFT$1 = "ArrowLeft";
var ARROW_RIGHT$1 = "ArrowRight";
var ARROW_UP$1 = "ArrowUp";
var ARROW_DOWN$1 = "ArrowDown";
function activeElement(doc) {
	let activeElement = doc.activeElement;
	while (((_activeElement = activeElement) == null || (_activeElement = _activeElement.shadowRoot) == null ? void 0 : _activeElement.activeElement) != null) {
		var _activeElement;
		activeElement = activeElement.shadowRoot.activeElement;
	}
	return activeElement;
}
function contains$1(parent, child) {
	if (!parent || !child) return false;
	const rootNode = child.getRootNode == null ? void 0 : child.getRootNode();
	if (parent.contains(child)) return true;
	if (rootNode && isShadowRoot(rootNode)) {
		let next = child;
		while (next) {
			if (parent === next) return true;
			next = next.parentNode || next.host;
		}
	}
	return false;
}
function getTarget$1(event) {
	if ("composedPath" in event) return event.composedPath()[0];
	return event.target;
}
function isEventTargetWithin(event, node) {
	if (node == null) return false;
	if ("composedPath" in event) return event.composedPath().includes(node);
	const e = event;
	return e.target != null && node.contains(e.target);
}
function isRootElement(element) {
	return element.matches("html,body");
}
function getDocument$1(node) {
	return (node == null ? void 0 : node.ownerDocument) || document;
}
function isTypeableElement(element) {
	return isHTMLElement(element) && element.matches(TYPEABLE_SELECTOR);
}
function isTypeableCombobox(element) {
	if (!element) return false;
	return element.getAttribute("role") === "combobox" && isTypeableElement(element);
}
function matchesFocusVisible(element) {
	if (!element || isJSDOM()) return true;
	try {
		return element.matches(":focus-visible");
	} catch (_e) {
		return true;
	}
}
function getFloatingFocusElement(floatingElement) {
	if (!floatingElement) return null;
	return floatingElement.hasAttribute(FOCUSABLE_ATTRIBUTE$1) ? floatingElement : floatingElement.querySelector("[" + FOCUSABLE_ATTRIBUTE$1 + "]") || floatingElement;
}
function getNodeChildren$1(nodes, id, onlyOpenChildren) {
	if (onlyOpenChildren === void 0) onlyOpenChildren = true;
	return nodes.filter((node) => {
		var _node$context;
		return node.parentId === id && (!onlyOpenChildren || ((_node$context = node.context) == null ? void 0 : _node$context.open));
	}).flatMap((child) => [child, ...getNodeChildren$1(nodes, child.id, onlyOpenChildren)]);
}
function getDeepestNode(nodes, id) {
	let deepestNodeId;
	let maxDepth = -1;
	function findDeepest(nodeId, depth) {
		if (depth > maxDepth) {
			deepestNodeId = nodeId;
			maxDepth = depth;
		}
		getNodeChildren$1(nodes, nodeId).forEach((child) => {
			findDeepest(child.id, depth + 1);
		});
	}
	findDeepest(id, 0);
	return nodes.find((node) => node.id === deepestNodeId);
}
function getNodeAncestors(nodes, id) {
	var _nodes$find;
	let allAncestors = [];
	let currentParentId = (_nodes$find = nodes.find((node) => node.id === id)) == null ? void 0 : _nodes$find.parentId;
	while (currentParentId) {
		const currentNode = nodes.find((node) => node.id === currentParentId);
		currentParentId = currentNode == null ? void 0 : currentNode.parentId;
		if (currentNode) allAncestors = allAncestors.concat(currentNode);
	}
	return allAncestors;
}
function stopEvent(event) {
	event.preventDefault();
	event.stopPropagation();
}
function isReactEvent(event) {
	return "nativeEvent" in event;
}
function isVirtualClick(event) {
	if (event.mozInputSource === 0 && event.isTrusted) return true;
	if (isAndroid() && event.pointerType) return event.type === "click" && event.buttons === 1;
	return event.detail === 0 && !event.pointerType;
}
function isVirtualPointerEvent(event) {
	if (isJSDOM()) return false;
	return !isAndroid() && event.width === 0 && event.height === 0 || isAndroid() && event.width === 1 && event.height === 1 && event.pressure === 0 && event.detail === 0 && event.pointerType === "mouse" || event.width < 1 && event.height < 1 && event.pressure === 0 && event.detail === 0 && event.pointerType === "touch";
}
function isMouseLikePointerType(pointerType, strict) {
	const values = ["mouse", "pen"];
	if (!strict) values.push("", void 0);
	return values.includes(pointerType);
}
var index$1 = typeof document !== "undefined" ? import_react.useLayoutEffect : function noop() {};
var SafeReact$1 = { ...import_react };
function useLatestRef$1(value) {
	const ref = import_react.useRef(value);
	index$1(() => {
		ref.current = value;
	});
	return ref;
}
var useSafeInsertionEffect = SafeReact$1.useInsertionEffect || ((fn) => fn());
function useEffectEvent(callback) {
	const ref = import_react.useRef(() => {
		throw new Error("Cannot call an event handler while rendering.");
	});
	useSafeInsertionEffect(() => {
		ref.current = callback;
	});
	return import_react.useCallback(function() {
		for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
		return ref.current == null ? void 0 : ref.current(...args);
	}, []);
}
function isDifferentGridRow(index, cols, prevRow) {
	return Math.floor(index / cols) !== prevRow;
}
function isIndexOutOfListBounds(listRef, index) {
	return index < 0 || index >= listRef.current.length;
}
function getMinListIndex(listRef, disabledIndices) {
	return findNonDisabledListIndex(listRef, { disabledIndices });
}
function getMaxListIndex(listRef, disabledIndices) {
	return findNonDisabledListIndex(listRef, {
		decrement: true,
		startingIndex: listRef.current.length,
		disabledIndices
	});
}
function findNonDisabledListIndex(listRef, _temp) {
	let { startingIndex = -1, decrement = false, disabledIndices, amount = 1 } = _temp === void 0 ? {} : _temp;
	let index = startingIndex;
	do
		index += decrement ? -amount : amount;
	while (index >= 0 && index <= listRef.current.length - 1 && isListIndexDisabled(listRef, index, disabledIndices));
	return index;
}
function getGridNavigatedIndex(listRef, _ref) {
	let { event, orientation, loop, rtl, cols, disabledIndices, minIndex, maxIndex, prevIndex, stopEvent: stop = false } = _ref;
	let nextIndex = prevIndex;
	if (event.key === ARROW_UP$1) {
		stop && stopEvent(event);
		if (prevIndex === -1) nextIndex = maxIndex;
		else {
			nextIndex = findNonDisabledListIndex(listRef, {
				startingIndex: nextIndex,
				amount: cols,
				decrement: true,
				disabledIndices
			});
			if (loop && (prevIndex - cols < minIndex || nextIndex < 0)) {
				const col = prevIndex % cols;
				const maxCol = maxIndex % cols;
				const offset = maxIndex - (maxCol - col);
				if (maxCol === col) nextIndex = maxIndex;
				else nextIndex = maxCol > col ? offset : offset - cols;
			}
		}
		if (isIndexOutOfListBounds(listRef, nextIndex)) nextIndex = prevIndex;
	}
	if (event.key === ARROW_DOWN$1) {
		stop && stopEvent(event);
		if (prevIndex === -1) nextIndex = minIndex;
		else {
			nextIndex = findNonDisabledListIndex(listRef, {
				startingIndex: prevIndex,
				amount: cols,
				disabledIndices
			});
			if (loop && prevIndex + cols > maxIndex) nextIndex = findNonDisabledListIndex(listRef, {
				startingIndex: prevIndex % cols - cols,
				amount: cols,
				disabledIndices
			});
		}
		if (isIndexOutOfListBounds(listRef, nextIndex)) nextIndex = prevIndex;
	}
	if (orientation === "both") {
		const prevRow = floor(prevIndex / cols);
		if (event.key === (rtl ? ARROW_LEFT$1 : ARROW_RIGHT$1)) {
			stop && stopEvent(event);
			if (prevIndex % cols !== cols - 1) {
				nextIndex = findNonDisabledListIndex(listRef, {
					startingIndex: prevIndex,
					disabledIndices
				});
				if (loop && isDifferentGridRow(nextIndex, cols, prevRow)) nextIndex = findNonDisabledListIndex(listRef, {
					startingIndex: prevIndex - prevIndex % cols - 1,
					disabledIndices
				});
			} else if (loop) nextIndex = findNonDisabledListIndex(listRef, {
				startingIndex: prevIndex - prevIndex % cols - 1,
				disabledIndices
			});
			if (isDifferentGridRow(nextIndex, cols, prevRow)) nextIndex = prevIndex;
		}
		if (event.key === (rtl ? ARROW_RIGHT$1 : ARROW_LEFT$1)) {
			stop && stopEvent(event);
			if (prevIndex % cols !== 0) {
				nextIndex = findNonDisabledListIndex(listRef, {
					startingIndex: prevIndex,
					decrement: true,
					disabledIndices
				});
				if (loop && isDifferentGridRow(nextIndex, cols, prevRow)) nextIndex = findNonDisabledListIndex(listRef, {
					startingIndex: prevIndex + (cols - prevIndex % cols),
					decrement: true,
					disabledIndices
				});
			} else if (loop) nextIndex = findNonDisabledListIndex(listRef, {
				startingIndex: prevIndex + (cols - prevIndex % cols),
				decrement: true,
				disabledIndices
			});
			if (isDifferentGridRow(nextIndex, cols, prevRow)) nextIndex = prevIndex;
		}
		const lastRow = floor(maxIndex / cols) === prevRow;
		if (isIndexOutOfListBounds(listRef, nextIndex)) if (loop && lastRow) nextIndex = event.key === (rtl ? ARROW_RIGHT$1 : ARROW_LEFT$1) ? maxIndex : findNonDisabledListIndex(listRef, {
			startingIndex: prevIndex - prevIndex % cols - 1,
			disabledIndices
		});
		else nextIndex = prevIndex;
	}
	return nextIndex;
}
/** For each cell index, gets the item index that occupies that cell */
function createGridCellMap(sizes, cols, dense) {
	const cellMap = [];
	let startIndex = 0;
	sizes.forEach((_ref2, index) => {
		let { width, height } = _ref2;
		if (width > cols) throw new Error("[Floating UI]: Invalid grid - item width at index " + index + " is greater than grid columns");
		let itemPlaced = false;
		if (dense) startIndex = 0;
		while (!itemPlaced) {
			const targetCells = [];
			for (let i = 0; i < width; i++) for (let j = 0; j < height; j++) targetCells.push(startIndex + i + j * cols);
			if (startIndex % cols + width <= cols && targetCells.every((cell) => cellMap[cell] == null)) {
				targetCells.forEach((cell) => {
					cellMap[cell] = index;
				});
				itemPlaced = true;
			} else startIndex++;
		}
	});
	return [...cellMap];
}
/** Gets cell index of an item's corner or -1 when index is -1. */
function getGridCellIndexOfCorner(index, sizes, cellMap, cols, corner) {
	if (index === -1) return -1;
	const firstCellIndex = cellMap.indexOf(index);
	const sizeItem = sizes[index];
	switch (corner) {
		case "tl": return firstCellIndex;
		case "tr":
			if (!sizeItem) return firstCellIndex;
			return firstCellIndex + sizeItem.width - 1;
		case "bl":
			if (!sizeItem) return firstCellIndex;
			return firstCellIndex + (sizeItem.height - 1) * cols;
		case "br": return cellMap.lastIndexOf(index);
	}
}
/** Gets all cell indices that correspond to the specified indices */
function getGridCellIndices(indices, cellMap) {
	return cellMap.flatMap((index, cellIndex) => indices.includes(index) ? [cellIndex] : []);
}
function isListIndexDisabled(listRef, index, disabledIndices) {
	if (typeof disabledIndices === "function") return disabledIndices(index);
	else if (disabledIndices) return disabledIndices.includes(index);
	const element = listRef.current[index];
	return element == null || element.hasAttribute("disabled") || element.getAttribute("aria-disabled") === "true";
}
var getTabbableOptions = () => ({
	getShadowRoot: true,
	displayCheck: typeof ResizeObserver === "function" && ResizeObserver.toString().includes("[native code]") ? "full" : "none"
});
function getTabbableIn(container, dir) {
	const list = tabbable(container, getTabbableOptions());
	const len = list.length;
	if (len === 0) return;
	const active = activeElement(getDocument$1(container));
	const index = list.indexOf(active);
	return list[index === -1 ? dir === 1 ? 0 : len - 1 : index + dir];
}
function getNextTabbable(referenceElement) {
	return getTabbableIn(getDocument$1(referenceElement).body, 1) || referenceElement;
}
function getPreviousTabbable(referenceElement) {
	return getTabbableIn(getDocument$1(referenceElement).body, -1) || referenceElement;
}
function isOutsideEvent(event, container) {
	const containerElement = container || event.currentTarget;
	const relatedTarget = event.relatedTarget;
	return !relatedTarget || !contains$1(containerElement, relatedTarget);
}
function disableFocusInside(container) {
	tabbable(container, getTabbableOptions()).forEach((element) => {
		element.dataset.tabindex = element.getAttribute("tabindex") || "";
		element.setAttribute("tabindex", "-1");
	});
}
function enableFocusInside(container) {
	container.querySelectorAll("[data-tabindex]").forEach((element) => {
		const tabindex = element.dataset.tabindex;
		delete element.dataset.tabindex;
		if (tabindex) element.setAttribute("tabindex", tabindex);
		else element.removeAttribute("tabindex");
	});
}

//#endregion
//#region node_modules/@floating-ui/core/dist/floating-ui.core.mjs
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom(), 1);
var import_jsx_runtime = require_jsx_runtime();
function computeCoordsFromPlacement(_ref, placement, rtl) {
	let { reference, floating } = _ref;
	const sideAxis = getSideAxis(placement);
	const alignmentAxis = getAlignmentAxis(placement);
	const alignLength = getAxisLength(alignmentAxis);
	const side = getSide(placement);
	const isVertical = sideAxis === "y";
	const commonX = reference.x + reference.width / 2 - floating.width / 2;
	const commonY = reference.y + reference.height / 2 - floating.height / 2;
	const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
	let coords;
	switch (side) {
		case "top":
			coords = {
				x: commonX,
				y: reference.y - floating.height
			};
			break;
		case "bottom":
			coords = {
				x: commonX,
				y: reference.y + reference.height
			};
			break;
		case "right":
			coords = {
				x: reference.x + reference.width,
				y: commonY
			};
			break;
		case "left":
			coords = {
				x: reference.x - floating.width,
				y: commonY
			};
			break;
		default: coords = {
			x: reference.x,
			y: reference.y
		};
	}
	switch (getAlignment(placement)) {
		case "start":
			coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
			break;
		case "end":
			coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
			break;
	}
	return coords;
}
/**
* Resolves with an object of overflow side offsets that determine how much the
* element is overflowing a given clipping boundary on each side.
* - positive = overflowing the boundary by that number of pixels
* - negative = how many pixels left before it will overflow
* - 0 = lies flush with the boundary
* @see https://floating-ui.com/docs/detectOverflow
*/
async function detectOverflow$1(state, options) {
	var _await$platform$isEle;
	if (options === void 0) options = {};
	const { x, y, platform, rects, elements, strategy } = state;
	const { boundary = "clippingAncestors", rootBoundary = "viewport", elementContext = "floating", altBoundary = false, padding = 0 } = evaluate(options, state);
	const paddingObject = getPaddingObject(padding);
	const element = elements[altBoundary ? elementContext === "floating" ? "reference" : "floating" : elementContext];
	const clippingClientRect = rectToClientRect(await platform.getClippingRect({
		element: ((_await$platform$isEle = await (platform.isElement == null ? void 0 : platform.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || await (platform.getDocumentElement == null ? void 0 : platform.getDocumentElement(elements.floating)),
		boundary,
		rootBoundary,
		strategy
	}));
	const rect = elementContext === "floating" ? {
		x,
		y,
		width: rects.floating.width,
		height: rects.floating.height
	} : rects.reference;
	const offsetParent = await (platform.getOffsetParent == null ? void 0 : platform.getOffsetParent(elements.floating));
	const offsetScale = await (platform.isElement == null ? void 0 : platform.isElement(offsetParent)) ? await (platform.getScale == null ? void 0 : platform.getScale(offsetParent)) || {
		x: 1,
		y: 1
	} : {
		x: 1,
		y: 1
	};
	const elementClientRect = rectToClientRect(platform.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform.convertOffsetParentRelativeRectToViewportRelativeRect({
		elements,
		rect,
		offsetParent,
		strategy
	}) : rect);
	return {
		top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
		bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
		left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
		right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
	};
}
/**
* Computes the `x` and `y` coordinates that will place the floating element
* next to a given reference element.
*
* This export does not have any `platform` interface logic. You will need to
* write one for the platform you are using Floating UI with.
*/
var computePosition$1 = async (reference, floating, config) => {
	const { placement = "bottom", strategy = "absolute", middleware = [], platform } = config;
	const validMiddleware = middleware.filter(Boolean);
	const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(floating));
	let rects = await platform.getElementRects({
		reference,
		floating,
		strategy
	});
	let { x, y } = computeCoordsFromPlacement(rects, placement, rtl);
	let statefulPlacement = placement;
	let middlewareData = {};
	let resetCount = 0;
	for (let i = 0; i < validMiddleware.length; i++) {
		var _platform$detectOverf;
		const { name, fn } = validMiddleware[i];
		const { x: nextX, y: nextY, data, reset } = await fn({
			x,
			y,
			initialPlacement: placement,
			placement: statefulPlacement,
			strategy,
			middlewareData,
			rects,
			platform: {
				...platform,
				detectOverflow: (_platform$detectOverf = platform.detectOverflow) != null ? _platform$detectOverf : detectOverflow$1
			},
			elements: {
				reference,
				floating
			}
		});
		x = nextX != null ? nextX : x;
		y = nextY != null ? nextY : y;
		middlewareData = {
			...middlewareData,
			[name]: {
				...middlewareData[name],
				...data
			}
		};
		if (reset && resetCount <= 50) {
			resetCount++;
			if (typeof reset === "object") {
				if (reset.placement) statefulPlacement = reset.placement;
				if (reset.rects) rects = reset.rects === true ? await platform.getElementRects({
					reference,
					floating,
					strategy
				}) : reset.rects;
				({x, y} = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
			}
			i = -1;
		}
	}
	return {
		x,
		y,
		placement: statefulPlacement,
		strategy,
		middlewareData
	};
};
/**
* Provides data to position an inner element of the floating element so that it
* appears centered to the reference element.
* @see https://floating-ui.com/docs/arrow
*/
var arrow$3 = (options) => ({
	name: "arrow",
	options,
	async fn(state) {
		const { x, y, placement, rects, platform, elements, middlewareData } = state;
		const { element, padding = 0 } = evaluate(options, state) || {};
		if (element == null) return {};
		const paddingObject = getPaddingObject(padding);
		const coords = {
			x,
			y
		};
		const axis = getAlignmentAxis(placement);
		const length = getAxisLength(axis);
		const arrowDimensions = await platform.getDimensions(element);
		const isYAxis = axis === "y";
		const minProp = isYAxis ? "top" : "left";
		const maxProp = isYAxis ? "bottom" : "right";
		const clientProp = isYAxis ? "clientHeight" : "clientWidth";
		const endDiff = rects.reference[length] + rects.reference[axis] - coords[axis] - rects.floating[length];
		const startDiff = coords[axis] - rects.reference[axis];
		const arrowOffsetParent = await (platform.getOffsetParent == null ? void 0 : platform.getOffsetParent(element));
		let clientSize = arrowOffsetParent ? arrowOffsetParent[clientProp] : 0;
		if (!clientSize || !await (platform.isElement == null ? void 0 : platform.isElement(arrowOffsetParent))) clientSize = elements.floating[clientProp] || rects.floating[length];
		const centerToReference = endDiff / 2 - startDiff / 2;
		const largestPossiblePadding = clientSize / 2 - arrowDimensions[length] / 2 - 1;
		const minPadding = min(paddingObject[minProp], largestPossiblePadding);
		const maxPadding = min(paddingObject[maxProp], largestPossiblePadding);
		const min$1 = minPadding;
		const max = clientSize - arrowDimensions[length] - maxPadding;
		const center = clientSize / 2 - arrowDimensions[length] / 2 + centerToReference;
		const offset = clamp(min$1, center, max);
		const shouldAddOffset = !middlewareData.arrow && getAlignment(placement) != null && center !== offset && rects.reference[length] / 2 - (center < min$1 ? minPadding : maxPadding) - arrowDimensions[length] / 2 < 0;
		const alignmentOffset = shouldAddOffset ? center < min$1 ? center - min$1 : center - max : 0;
		return {
			[axis]: coords[axis] + alignmentOffset,
			data: {
				[axis]: offset,
				centerOffset: center - offset - alignmentOffset,
				...shouldAddOffset && { alignmentOffset }
			},
			reset: shouldAddOffset
		};
	}
});
function getPlacementList(alignment, autoAlignment, allowedPlacements) {
	return (alignment ? [...allowedPlacements.filter((placement) => getAlignment(placement) === alignment), ...allowedPlacements.filter((placement) => getAlignment(placement) !== alignment)] : allowedPlacements.filter((placement) => getSide(placement) === placement)).filter((placement) => {
		if (alignment) return getAlignment(placement) === alignment || (autoAlignment ? getOppositeAlignmentPlacement(placement) !== placement : false);
		return true;
	});
}
/**
* Optimizes the visibility of the floating element by choosing the placement
* that has the most space available automatically, without needing to specify a
* preferred placement. Alternative to `flip`.
* @see https://floating-ui.com/docs/autoPlacement
*/
var autoPlacement$2 = function(options) {
	if (options === void 0) options = {};
	return {
		name: "autoPlacement",
		options,
		async fn(state) {
			var _middlewareData$autoP, _middlewareData$autoP2, _placementsThatFitOnE;
			const { rects, middlewareData, placement, platform, elements } = state;
			const { crossAxis = false, alignment, allowedPlacements = placements, autoAlignment = true, ...detectOverflowOptions } = evaluate(options, state);
			const placements$1 = alignment !== void 0 || allowedPlacements === placements ? getPlacementList(alignment || null, autoAlignment, allowedPlacements) : allowedPlacements;
			const overflow = await platform.detectOverflow(state, detectOverflowOptions);
			const currentIndex = ((_middlewareData$autoP = middlewareData.autoPlacement) == null ? void 0 : _middlewareData$autoP.index) || 0;
			const currentPlacement = placements$1[currentIndex];
			if (currentPlacement == null) return {};
			const alignmentSides = getAlignmentSides(currentPlacement, rects, await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating)));
			if (placement !== currentPlacement) return { reset: { placement: placements$1[0] } };
			const currentOverflows = [
				overflow[getSide(currentPlacement)],
				overflow[alignmentSides[0]],
				overflow[alignmentSides[1]]
			];
			const allOverflows = [...((_middlewareData$autoP2 = middlewareData.autoPlacement) == null ? void 0 : _middlewareData$autoP2.overflows) || [], {
				placement: currentPlacement,
				overflows: currentOverflows
			}];
			const nextPlacement = placements$1[currentIndex + 1];
			if (nextPlacement) return {
				data: {
					index: currentIndex + 1,
					overflows: allOverflows
				},
				reset: { placement: nextPlacement }
			};
			const placementsSortedByMostSpace = allOverflows.map((d) => {
				const alignment = getAlignment(d.placement);
				return [
					d.placement,
					alignment && crossAxis ? d.overflows.slice(0, 2).reduce((acc, v) => acc + v, 0) : d.overflows[0],
					d.overflows
				];
			}).sort((a, b) => a[1] - b[1]);
			const resetPlacement = ((_placementsThatFitOnE = placementsSortedByMostSpace.filter((d) => d[2].slice(0, getAlignment(d[0]) ? 2 : 3).every((v) => v <= 0))[0]) == null ? void 0 : _placementsThatFitOnE[0]) || placementsSortedByMostSpace[0][0];
			if (resetPlacement !== placement) return {
				data: {
					index: currentIndex + 1,
					overflows: allOverflows
				},
				reset: { placement: resetPlacement }
			};
			return {};
		}
	};
};
/**
* Optimizes the visibility of the floating element by flipping the `placement`
* in order to keep it in view when the preferred placement(s) will overflow the
* clipping boundary. Alternative to `autoPlacement`.
* @see https://floating-ui.com/docs/flip
*/
var flip$2 = function(options) {
	if (options === void 0) options = {};
	return {
		name: "flip",
		options,
		async fn(state) {
			var _middlewareData$arrow, _middlewareData$flip;
			const { placement, middlewareData, rects, initialPlacement, platform, elements } = state;
			const { mainAxis: checkMainAxis = true, crossAxis: checkCrossAxis = true, fallbackPlacements: specifiedFallbackPlacements, fallbackStrategy = "bestFit", fallbackAxisSideDirection = "none", flipAlignment = true, ...detectOverflowOptions } = evaluate(options, state);
			if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) return {};
			const side = getSide(placement);
			const initialSideAxis = getSideAxis(initialPlacement);
			const isBasePlacement = getSide(initialPlacement) === initialPlacement;
			const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
			const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
			const hasFallbackAxisSideDirection = fallbackAxisSideDirection !== "none";
			if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
			const placements = [initialPlacement, ...fallbackPlacements];
			const overflow = await platform.detectOverflow(state, detectOverflowOptions);
			const overflows = [];
			let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
			if (checkMainAxis) overflows.push(overflow[side]);
			if (checkCrossAxis) {
				const sides = getAlignmentSides(placement, rects, rtl);
				overflows.push(overflow[sides[0]], overflow[sides[1]]);
			}
			overflowsData = [...overflowsData, {
				placement,
				overflows
			}];
			if (!overflows.every((side) => side <= 0)) {
				var _middlewareData$flip2, _overflowsData$filter;
				const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
				const nextPlacement = placements[nextIndex];
				if (nextPlacement) {
					if (!(checkCrossAxis === "alignment" ? initialSideAxis !== getSideAxis(nextPlacement) : false) || overflowsData.every((d) => getSideAxis(d.placement) === initialSideAxis ? d.overflows[0] > 0 : true)) return {
						data: {
							index: nextIndex,
							overflows: overflowsData
						},
						reset: { placement: nextPlacement }
					};
				}
				let resetPlacement = (_overflowsData$filter = overflowsData.filter((d) => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;
				if (!resetPlacement) switch (fallbackStrategy) {
					case "bestFit": {
						var _overflowsData$filter2;
						const placement = (_overflowsData$filter2 = overflowsData.filter((d) => {
							if (hasFallbackAxisSideDirection) {
								const currentSideAxis = getSideAxis(d.placement);
								return currentSideAxis === initialSideAxis || currentSideAxis === "y";
							}
							return true;
						}).map((d) => [d.placement, d.overflows.filter((overflow) => overflow > 0).reduce((acc, overflow) => acc + overflow, 0)]).sort((a, b) => a[1] - b[1])[0]) == null ? void 0 : _overflowsData$filter2[0];
						if (placement) resetPlacement = placement;
						break;
					}
					case "initialPlacement":
						resetPlacement = initialPlacement;
						break;
				}
				if (placement !== resetPlacement) return { reset: { placement: resetPlacement } };
			}
			return {};
		}
	};
};
function getSideOffsets(overflow, rect) {
	return {
		top: overflow.top - rect.height,
		right: overflow.right - rect.width,
		bottom: overflow.bottom - rect.height,
		left: overflow.left - rect.width
	};
}
function isAnySideFullyClipped(overflow) {
	return sides.some((side) => overflow[side] >= 0);
}
/**
* Provides data to hide the floating element in applicable situations, such as
* when it is not in the same clipping context as the reference element.
* @see https://floating-ui.com/docs/hide
*/
var hide$2 = function(options) {
	if (options === void 0) options = {};
	return {
		name: "hide",
		options,
		async fn(state) {
			const { rects, platform } = state;
			const { strategy = "referenceHidden", ...detectOverflowOptions } = evaluate(options, state);
			switch (strategy) {
				case "referenceHidden": {
					const offsets = getSideOffsets(await platform.detectOverflow(state, {
						...detectOverflowOptions,
						elementContext: "reference"
					}), rects.reference);
					return { data: {
						referenceHiddenOffsets: offsets,
						referenceHidden: isAnySideFullyClipped(offsets)
					} };
				}
				case "escaped": {
					const offsets = getSideOffsets(await platform.detectOverflow(state, {
						...detectOverflowOptions,
						altBoundary: true
					}), rects.floating);
					return { data: {
						escapedOffsets: offsets,
						escaped: isAnySideFullyClipped(offsets)
					} };
				}
				default: return {};
			}
		}
	};
};
function getBoundingRect(rects) {
	const minX = min(...rects.map((rect) => rect.left));
	const minY = min(...rects.map((rect) => rect.top));
	const maxX = max(...rects.map((rect) => rect.right));
	const maxY = max(...rects.map((rect) => rect.bottom));
	return {
		x: minX,
		y: minY,
		width: maxX - minX,
		height: maxY - minY
	};
}
function getRectsByLine(rects) {
	const sortedRects = rects.slice().sort((a, b) => a.y - b.y);
	const groups = [];
	let prevRect = null;
	for (let i = 0; i < sortedRects.length; i++) {
		const rect = sortedRects[i];
		if (!prevRect || rect.y - prevRect.y > prevRect.height / 2) groups.push([rect]);
		else groups[groups.length - 1].push(rect);
		prevRect = rect;
	}
	return groups.map((rect) => rectToClientRect(getBoundingRect(rect)));
}
/**
* Provides improved positioning for inline reference elements that can span
* over multiple lines, such as hyperlinks or range selections.
* @see https://floating-ui.com/docs/inline
*/
var inline$2 = function(options) {
	if (options === void 0) options = {};
	return {
		name: "inline",
		options,
		async fn(state) {
			const { placement, elements, rects, platform, strategy } = state;
			const { padding = 2, x, y } = evaluate(options, state);
			const nativeClientRects = Array.from(await (platform.getClientRects == null ? void 0 : platform.getClientRects(elements.reference)) || []);
			const clientRects = getRectsByLine(nativeClientRects);
			const fallback = rectToClientRect(getBoundingRect(nativeClientRects));
			const paddingObject = getPaddingObject(padding);
			function getBoundingClientRect() {
				if (clientRects.length === 2 && clientRects[0].left > clientRects[1].right && x != null && y != null) return clientRects.find((rect) => x > rect.left - paddingObject.left && x < rect.right + paddingObject.right && y > rect.top - paddingObject.top && y < rect.bottom + paddingObject.bottom) || fallback;
				if (clientRects.length >= 2) {
					if (getSideAxis(placement) === "y") {
						const firstRect = clientRects[0];
						const lastRect = clientRects[clientRects.length - 1];
						const isTop = getSide(placement) === "top";
						const top = firstRect.top;
						const bottom = lastRect.bottom;
						const left = isTop ? firstRect.left : lastRect.left;
						const right = isTop ? firstRect.right : lastRect.right;
						return {
							top,
							bottom,
							left,
							right,
							width: right - left,
							height: bottom - top,
							x: left,
							y: top
						};
					}
					const isLeftSide = getSide(placement) === "left";
					const maxRight = max(...clientRects.map((rect) => rect.right));
					const minLeft = min(...clientRects.map((rect) => rect.left));
					const measureRects = clientRects.filter((rect) => isLeftSide ? rect.left === minLeft : rect.right === maxRight);
					const top = measureRects[0].top;
					const bottom = measureRects[measureRects.length - 1].bottom;
					const left = minLeft;
					const right = maxRight;
					return {
						top,
						bottom,
						left,
						right,
						width: right - left,
						height: bottom - top,
						x: left,
						y: top
					};
				}
				return fallback;
			}
			const resetRects = await platform.getElementRects({
				reference: { getBoundingClientRect },
				floating: elements.floating,
				strategy
			});
			if (rects.reference.x !== resetRects.reference.x || rects.reference.y !== resetRects.reference.y || rects.reference.width !== resetRects.reference.width || rects.reference.height !== resetRects.reference.height) return { reset: { rects: resetRects } };
			return {};
		}
	};
};
var originSides = /* @__PURE__ */ new Set(["left", "top"]);
async function convertValueToCoords(state, options) {
	const { placement, platform, elements } = state;
	const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
	const side = getSide(placement);
	const alignment = getAlignment(placement);
	const isVertical = getSideAxis(placement) === "y";
	const mainAxisMulti = originSides.has(side) ? -1 : 1;
	const crossAxisMulti = rtl && isVertical ? -1 : 1;
	const rawValue = evaluate(options, state);
	let { mainAxis, crossAxis, alignmentAxis } = typeof rawValue === "number" ? {
		mainAxis: rawValue,
		crossAxis: 0,
		alignmentAxis: null
	} : {
		mainAxis: rawValue.mainAxis || 0,
		crossAxis: rawValue.crossAxis || 0,
		alignmentAxis: rawValue.alignmentAxis
	};
	if (alignment && typeof alignmentAxis === "number") crossAxis = alignment === "end" ? alignmentAxis * -1 : alignmentAxis;
	return isVertical ? {
		x: crossAxis * crossAxisMulti,
		y: mainAxis * mainAxisMulti
	} : {
		x: mainAxis * mainAxisMulti,
		y: crossAxis * crossAxisMulti
	};
}
/**
* Modifies the placement by translating the floating element along the
* specified axes.
* A number (shorthand for `mainAxis` or distance), or an axes configuration
* object may be passed.
* @see https://floating-ui.com/docs/offset
*/
var offset$2 = function(options) {
	if (options === void 0) options = 0;
	return {
		name: "offset",
		options,
		async fn(state) {
			var _middlewareData$offse, _middlewareData$arrow;
			const { x, y, placement, middlewareData } = state;
			const diffCoords = await convertValueToCoords(state, options);
			if (placement === ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse.placement) && (_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) return {};
			return {
				x: x + diffCoords.x,
				y: y + diffCoords.y,
				data: {
					...diffCoords,
					placement
				}
			};
		}
	};
};
/**
* Optimizes the visibility of the floating element by shifting it in order to
* keep it in view when it will overflow the clipping boundary.
* @see https://floating-ui.com/docs/shift
*/
var shift$2 = function(options) {
	if (options === void 0) options = {};
	return {
		name: "shift",
		options,
		async fn(state) {
			const { x, y, placement, platform } = state;
			const { mainAxis: checkMainAxis = true, crossAxis: checkCrossAxis = false, limiter = { fn: (_ref) => {
				let { x, y } = _ref;
				return {
					x,
					y
				};
			} }, ...detectOverflowOptions } = evaluate(options, state);
			const coords = {
				x,
				y
			};
			const overflow = await platform.detectOverflow(state, detectOverflowOptions);
			const crossAxis = getSideAxis(getSide(placement));
			const mainAxis = getOppositeAxis(crossAxis);
			let mainAxisCoord = coords[mainAxis];
			let crossAxisCoord = coords[crossAxis];
			if (checkMainAxis) {
				const minSide = mainAxis === "y" ? "top" : "left";
				const maxSide = mainAxis === "y" ? "bottom" : "right";
				const min = mainAxisCoord + overflow[minSide];
				const max = mainAxisCoord - overflow[maxSide];
				mainAxisCoord = clamp(min, mainAxisCoord, max);
			}
			if (checkCrossAxis) {
				const minSide = crossAxis === "y" ? "top" : "left";
				const maxSide = crossAxis === "y" ? "bottom" : "right";
				const min = crossAxisCoord + overflow[minSide];
				const max = crossAxisCoord - overflow[maxSide];
				crossAxisCoord = clamp(min, crossAxisCoord, max);
			}
			const limitedCoords = limiter.fn({
				...state,
				[mainAxis]: mainAxisCoord,
				[crossAxis]: crossAxisCoord
			});
			return {
				...limitedCoords,
				data: {
					x: limitedCoords.x - x,
					y: limitedCoords.y - y,
					enabled: {
						[mainAxis]: checkMainAxis,
						[crossAxis]: checkCrossAxis
					}
				}
			};
		}
	};
};
/**
* Built-in `limiter` that will stop `shift()` at a certain point.
*/
var limitShift$2 = function(options) {
	if (options === void 0) options = {};
	return {
		options,
		fn(state) {
			const { x, y, placement, rects, middlewareData } = state;
			const { offset = 0, mainAxis: checkMainAxis = true, crossAxis: checkCrossAxis = true } = evaluate(options, state);
			const coords = {
				x,
				y
			};
			const crossAxis = getSideAxis(placement);
			const mainAxis = getOppositeAxis(crossAxis);
			let mainAxisCoord = coords[mainAxis];
			let crossAxisCoord = coords[crossAxis];
			const rawOffset = evaluate(offset, state);
			const computedOffset = typeof rawOffset === "number" ? {
				mainAxis: rawOffset,
				crossAxis: 0
			} : {
				mainAxis: 0,
				crossAxis: 0,
				...rawOffset
			};
			if (checkMainAxis) {
				const len = mainAxis === "y" ? "height" : "width";
				const limitMin = rects.reference[mainAxis] - rects.floating[len] + computedOffset.mainAxis;
				const limitMax = rects.reference[mainAxis] + rects.reference[len] - computedOffset.mainAxis;
				if (mainAxisCoord < limitMin) mainAxisCoord = limitMin;
				else if (mainAxisCoord > limitMax) mainAxisCoord = limitMax;
			}
			if (checkCrossAxis) {
				var _middlewareData$offse, _middlewareData$offse2;
				const len = mainAxis === "y" ? "width" : "height";
				const isOriginSide = originSides.has(getSide(placement));
				const limitMin = rects.reference[crossAxis] - rects.floating[len] + (isOriginSide ? ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse[crossAxis]) || 0 : 0) + (isOriginSide ? 0 : computedOffset.crossAxis);
				const limitMax = rects.reference[crossAxis] + rects.reference[len] + (isOriginSide ? 0 : ((_middlewareData$offse2 = middlewareData.offset) == null ? void 0 : _middlewareData$offse2[crossAxis]) || 0) - (isOriginSide ? computedOffset.crossAxis : 0);
				if (crossAxisCoord < limitMin) crossAxisCoord = limitMin;
				else if (crossAxisCoord > limitMax) crossAxisCoord = limitMax;
			}
			return {
				[mainAxis]: mainAxisCoord,
				[crossAxis]: crossAxisCoord
			};
		}
	};
};
/**
* Provides data that allows you to change the size of the floating element —
* for instance, prevent it from overflowing the clipping boundary or match the
* width of the reference element.
* @see https://floating-ui.com/docs/size
*/
var size$2 = function(options) {
	if (options === void 0) options = {};
	return {
		name: "size",
		options,
		async fn(state) {
			var _state$middlewareData, _state$middlewareData2;
			const { placement, rects, platform, elements } = state;
			const { apply = () => {}, ...detectOverflowOptions } = evaluate(options, state);
			const overflow = await platform.detectOverflow(state, detectOverflowOptions);
			const side = getSide(placement);
			const alignment = getAlignment(placement);
			const isYAxis = getSideAxis(placement) === "y";
			const { width, height } = rects.floating;
			let heightSide;
			let widthSide;
			if (side === "top" || side === "bottom") {
				heightSide = side;
				widthSide = alignment === (await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating)) ? "start" : "end") ? "left" : "right";
			} else {
				widthSide = side;
				heightSide = alignment === "end" ? "top" : "bottom";
			}
			const maximumClippingHeight = height - overflow.top - overflow.bottom;
			const maximumClippingWidth = width - overflow.left - overflow.right;
			const overflowAvailableHeight = min(height - overflow[heightSide], maximumClippingHeight);
			const overflowAvailableWidth = min(width - overflow[widthSide], maximumClippingWidth);
			const noShift = !state.middlewareData.shift;
			let availableHeight = overflowAvailableHeight;
			let availableWidth = overflowAvailableWidth;
			if ((_state$middlewareData = state.middlewareData.shift) != null && _state$middlewareData.enabled.x) availableWidth = maximumClippingWidth;
			if ((_state$middlewareData2 = state.middlewareData.shift) != null && _state$middlewareData2.enabled.y) availableHeight = maximumClippingHeight;
			if (noShift && !alignment) {
				const xMin = max(overflow.left, 0);
				const xMax = max(overflow.right, 0);
				const yMin = max(overflow.top, 0);
				const yMax = max(overflow.bottom, 0);
				if (isYAxis) availableWidth = width - 2 * (xMin !== 0 || xMax !== 0 ? xMin + xMax : max(overflow.left, overflow.right));
				else availableHeight = height - 2 * (yMin !== 0 || yMax !== 0 ? yMin + yMax : max(overflow.top, overflow.bottom));
			}
			await apply({
				...state,
				availableWidth,
				availableHeight
			});
			const nextDimensions = await platform.getDimensions(elements.floating);
			if (width !== nextDimensions.width || height !== nextDimensions.height) return { reset: { rects: true } };
			return {};
		}
	};
};

//#endregion
//#region node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function getCssDimensions(element) {
	const css = getComputedStyle$1(element);
	let width = parseFloat(css.width) || 0;
	let height = parseFloat(css.height) || 0;
	const hasOffset = isHTMLElement(element);
	const offsetWidth = hasOffset ? element.offsetWidth : width;
	const offsetHeight = hasOffset ? element.offsetHeight : height;
	const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
	if (shouldFallback) {
		width = offsetWidth;
		height = offsetHeight;
	}
	return {
		width,
		height,
		$: shouldFallback
	};
}
function unwrapElement(element) {
	return !isElement(element) ? element.contextElement : element;
}
function getScale(element) {
	const domElement = unwrapElement(element);
	if (!isHTMLElement(domElement)) return createCoords(1);
	const rect = domElement.getBoundingClientRect();
	const { width, height, $ } = getCssDimensions(domElement);
	let x = ($ ? round(rect.width) : rect.width) / width;
	let y = ($ ? round(rect.height) : rect.height) / height;
	if (!x || !Number.isFinite(x)) x = 1;
	if (!y || !Number.isFinite(y)) y = 1;
	return {
		x,
		y
	};
}
var noOffsets = /* @__PURE__ */ createCoords(0);
function getVisualOffsets(element) {
	const win = getWindow(element);
	if (!isWebKit() || !win.visualViewport) return noOffsets;
	return {
		x: win.visualViewport.offsetLeft,
		y: win.visualViewport.offsetTop
	};
}
function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
	if (isFixed === void 0) isFixed = false;
	if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element)) return false;
	return isFixed;
}
function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
	if (includeScale === void 0) includeScale = false;
	if (isFixedStrategy === void 0) isFixedStrategy = false;
	const clientRect = element.getBoundingClientRect();
	const domElement = unwrapElement(element);
	let scale = createCoords(1);
	if (includeScale) if (offsetParent) {
		if (isElement(offsetParent)) scale = getScale(offsetParent);
	} else scale = getScale(element);
	const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
	let x = (clientRect.left + visualOffsets.x) / scale.x;
	let y = (clientRect.top + visualOffsets.y) / scale.y;
	let width = clientRect.width / scale.x;
	let height = clientRect.height / scale.y;
	if (domElement) {
		const win = getWindow(domElement);
		const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
		let currentWin = win;
		let currentIFrame = getFrameElement(currentWin);
		while (currentIFrame && offsetParent && offsetWin !== currentWin) {
			const iframeScale = getScale(currentIFrame);
			const iframeRect = currentIFrame.getBoundingClientRect();
			const css = getComputedStyle$1(currentIFrame);
			const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
			const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
			x *= iframeScale.x;
			y *= iframeScale.y;
			width *= iframeScale.x;
			height *= iframeScale.y;
			x += left;
			y += top;
			currentWin = getWindow(currentIFrame);
			currentIFrame = getFrameElement(currentWin);
		}
	}
	return rectToClientRect({
		width,
		height,
		x,
		y
	});
}
function getWindowScrollBarX(element, rect) {
	const leftScroll = getNodeScroll(element).scrollLeft;
	if (!rect) return getBoundingClientRect(getDocumentElement(element)).left + leftScroll;
	return rect.left + leftScroll;
}
function getHTMLOffset(documentElement, scroll) {
	const htmlRect = documentElement.getBoundingClientRect();
	return {
		x: htmlRect.left + scroll.scrollLeft - getWindowScrollBarX(documentElement, htmlRect),
		y: htmlRect.top + scroll.scrollTop
	};
}
function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
	let { elements, rect, offsetParent, strategy } = _ref;
	const isFixed = strategy === "fixed";
	const documentElement = getDocumentElement(offsetParent);
	const topLayer = elements ? isTopLayer(elements.floating) : false;
	if (offsetParent === documentElement || topLayer && isFixed) return rect;
	let scroll = {
		scrollLeft: 0,
		scrollTop: 0
	};
	let scale = createCoords(1);
	const offsets = createCoords(0);
	const isOffsetParentAnElement = isHTMLElement(offsetParent);
	if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
		if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) scroll = getNodeScroll(offsetParent);
		if (isHTMLElement(offsetParent)) {
			const offsetRect = getBoundingClientRect(offsetParent);
			scale = getScale(offsetParent);
			offsets.x = offsetRect.x + offsetParent.clientLeft;
			offsets.y = offsetRect.y + offsetParent.clientTop;
		}
	}
	const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
	return {
		width: rect.width * scale.x,
		height: rect.height * scale.y,
		x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x + htmlOffset.x,
		y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y + htmlOffset.y
	};
}
function getClientRects(element) {
	return Array.from(element.getClientRects());
}
function getDocumentRect(element) {
	const html = getDocumentElement(element);
	const scroll = getNodeScroll(element);
	const body = element.ownerDocument.body;
	const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
	const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
	let x = -scroll.scrollLeft + getWindowScrollBarX(element);
	const y = -scroll.scrollTop;
	if (getComputedStyle$1(body).direction === "rtl") x += max(html.clientWidth, body.clientWidth) - width;
	return {
		width,
		height,
		x,
		y
	};
}
var SCROLLBAR_MAX = 25;
function getViewportRect(element, strategy) {
	const win = getWindow(element);
	const html = getDocumentElement(element);
	const visualViewport = win.visualViewport;
	let width = html.clientWidth;
	let height = html.clientHeight;
	let x = 0;
	let y = 0;
	if (visualViewport) {
		width = visualViewport.width;
		height = visualViewport.height;
		const visualViewportBased = isWebKit();
		if (!visualViewportBased || visualViewportBased && strategy === "fixed") {
			x = visualViewport.offsetLeft;
			y = visualViewport.offsetTop;
		}
	}
	const windowScrollbarX = getWindowScrollBarX(html);
	if (windowScrollbarX <= 0) {
		const doc = html.ownerDocument;
		const body = doc.body;
		const bodyStyles = getComputedStyle(body);
		const bodyMarginInline = doc.compatMode === "CSS1Compat" ? parseFloat(bodyStyles.marginLeft) + parseFloat(bodyStyles.marginRight) || 0 : 0;
		const clippingStableScrollbarWidth = Math.abs(html.clientWidth - body.clientWidth - bodyMarginInline);
		if (clippingStableScrollbarWidth <= SCROLLBAR_MAX) width -= clippingStableScrollbarWidth;
	} else if (windowScrollbarX <= SCROLLBAR_MAX) width += windowScrollbarX;
	return {
		width,
		height,
		x,
		y
	};
}
var absoluteOrFixed = /* @__PURE__ */ new Set(["absolute", "fixed"]);
function getInnerBoundingClientRect(element, strategy) {
	const clientRect = getBoundingClientRect(element, true, strategy === "fixed");
	const top = clientRect.top + element.clientTop;
	const left = clientRect.left + element.clientLeft;
	const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
	return {
		width: element.clientWidth * scale.x,
		height: element.clientHeight * scale.y,
		x: left * scale.x,
		y: top * scale.y
	};
}
function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
	let rect;
	if (clippingAncestor === "viewport") rect = getViewportRect(element, strategy);
	else if (clippingAncestor === "document") rect = getDocumentRect(getDocumentElement(element));
	else if (isElement(clippingAncestor)) rect = getInnerBoundingClientRect(clippingAncestor, strategy);
	else {
		const visualOffsets = getVisualOffsets(element);
		rect = {
			x: clippingAncestor.x - visualOffsets.x,
			y: clippingAncestor.y - visualOffsets.y,
			width: clippingAncestor.width,
			height: clippingAncestor.height
		};
	}
	return rectToClientRect(rect);
}
function hasFixedPositionAncestor(element, stopNode) {
	const parentNode = getParentNode(element);
	if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) return false;
	return getComputedStyle$1(parentNode).position === "fixed" || hasFixedPositionAncestor(parentNode, stopNode);
}
function getClippingElementAncestors(element, cache) {
	const cachedResult = cache.get(element);
	if (cachedResult) return cachedResult;
	let result = getOverflowAncestors(element, [], false).filter((el) => isElement(el) && getNodeName(el) !== "body");
	let currentContainingBlockComputedStyle = null;
	const elementIsFixed = getComputedStyle$1(element).position === "fixed";
	let currentNode = elementIsFixed ? getParentNode(element) : element;
	while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
		const computedStyle = getComputedStyle$1(currentNode);
		const currentNodeIsContaining = isContainingBlock(currentNode);
		if (!currentNodeIsContaining && computedStyle.position === "fixed") currentContainingBlockComputedStyle = null;
		if (elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === "static" && !!currentContainingBlockComputedStyle && absoluteOrFixed.has(currentContainingBlockComputedStyle.position) || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode)) result = result.filter((ancestor) => ancestor !== currentNode);
		else currentContainingBlockComputedStyle = computedStyle;
		currentNode = getParentNode(currentNode);
	}
	cache.set(element, result);
	return result;
}
function getClippingRect(_ref) {
	let { element, boundary, rootBoundary, strategy } = _ref;
	const clippingAncestors = [...boundary === "clippingAncestors" ? isTopLayer(element) ? [] : getClippingElementAncestors(element, this._c) : [].concat(boundary), rootBoundary];
	const firstClippingAncestor = clippingAncestors[0];
	const clippingRect = clippingAncestors.reduce((accRect, clippingAncestor) => {
		const rect = getClientRectFromClippingAncestor(element, clippingAncestor, strategy);
		accRect.top = max(rect.top, accRect.top);
		accRect.right = min(rect.right, accRect.right);
		accRect.bottom = min(rect.bottom, accRect.bottom);
		accRect.left = max(rect.left, accRect.left);
		return accRect;
	}, getClientRectFromClippingAncestor(element, firstClippingAncestor, strategy));
	return {
		width: clippingRect.right - clippingRect.left,
		height: clippingRect.bottom - clippingRect.top,
		x: clippingRect.left,
		y: clippingRect.top
	};
}
function getDimensions(element) {
	const { width, height } = getCssDimensions(element);
	return {
		width,
		height
	};
}
function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
	const isOffsetParentAnElement = isHTMLElement(offsetParent);
	const documentElement = getDocumentElement(offsetParent);
	const isFixed = strategy === "fixed";
	const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
	let scroll = {
		scrollLeft: 0,
		scrollTop: 0
	};
	const offsets = createCoords(0);
	function setLeftRTLScrollbarOffset() {
		offsets.x = getWindowScrollBarX(documentElement);
	}
	if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
		if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) scroll = getNodeScroll(offsetParent);
		if (isOffsetParentAnElement) {
			const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
			offsets.x = offsetRect.x + offsetParent.clientLeft;
			offsets.y = offsetRect.y + offsetParent.clientTop;
		} else if (documentElement) setLeftRTLScrollbarOffset();
	}
	if (isFixed && !isOffsetParentAnElement && documentElement) setLeftRTLScrollbarOffset();
	const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
	return {
		x: rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x,
		y: rect.top + scroll.scrollTop - offsets.y - htmlOffset.y,
		width: rect.width,
		height: rect.height
	};
}
function isStaticPositioned(element) {
	return getComputedStyle$1(element).position === "static";
}
function getTrueOffsetParent(element, polyfill) {
	if (!isHTMLElement(element) || getComputedStyle$1(element).position === "fixed") return null;
	if (polyfill) return polyfill(element);
	let rawOffsetParent = element.offsetParent;
	if (getDocumentElement(element) === rawOffsetParent) rawOffsetParent = rawOffsetParent.ownerDocument.body;
	return rawOffsetParent;
}
function getOffsetParent(element, polyfill) {
	const win = getWindow(element);
	if (isTopLayer(element)) return win;
	if (!isHTMLElement(element)) {
		let svgOffsetParent = getParentNode(element);
		while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
			if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) return svgOffsetParent;
			svgOffsetParent = getParentNode(svgOffsetParent);
		}
		return win;
	}
	let offsetParent = getTrueOffsetParent(element, polyfill);
	while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) offsetParent = getTrueOffsetParent(offsetParent, polyfill);
	if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) return win;
	return offsetParent || getContainingBlock(element) || win;
}
var getElementRects = async function(data) {
	const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
	const getDimensionsFn = this.getDimensions;
	const floatingDimensions = await getDimensionsFn(data.floating);
	return {
		reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
		floating: {
			x: 0,
			y: 0,
			width: floatingDimensions.width,
			height: floatingDimensions.height
		}
	};
};
function isRTL(element) {
	return getComputedStyle$1(element).direction === "rtl";
}
var platform = {
	convertOffsetParentRelativeRectToViewportRelativeRect,
	getDocumentElement,
	getClippingRect,
	getOffsetParent,
	getElementRects,
	getClientRects,
	getDimensions,
	getScale,
	isElement,
	isRTL
};
function rectsAreEqual(a, b) {
	return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}
function observeMove(element, onMove) {
	let io = null;
	let timeoutId;
	const root = getDocumentElement(element);
	function cleanup() {
		var _io;
		clearTimeout(timeoutId);
		(_io = io) == null || _io.disconnect();
		io = null;
	}
	function refresh(skip, threshold) {
		if (skip === void 0) skip = false;
		if (threshold === void 0) threshold = 1;
		cleanup();
		const elementRectForRootMargin = element.getBoundingClientRect();
		const { left, top, width, height } = elementRectForRootMargin;
		if (!skip) onMove();
		if (!width || !height) return;
		const insetTop = floor(top);
		const insetRight = floor(root.clientWidth - (left + width));
		const insetBottom = floor(root.clientHeight - (top + height));
		const insetLeft = floor(left);
		const options = {
			rootMargin: -insetTop + "px " + -insetRight + "px " + -insetBottom + "px " + -insetLeft + "px",
			threshold: max(0, min(1, threshold)) || 1
		};
		let isFirstUpdate = true;
		function handleObserve(entries) {
			const ratio = entries[0].intersectionRatio;
			if (ratio !== threshold) {
				if (!isFirstUpdate) return refresh();
				if (!ratio) timeoutId = setTimeout(() => {
					refresh(false, 1e-7);
				}, 1e3);
				else refresh(false, ratio);
			}
			if (ratio === 1 && !rectsAreEqual(elementRectForRootMargin, element.getBoundingClientRect())) refresh();
			isFirstUpdate = false;
		}
		try {
			io = new IntersectionObserver(handleObserve, {
				...options,
				root: root.ownerDocument
			});
		} catch (_e) {
			io = new IntersectionObserver(handleObserve, options);
		}
		io.observe(element);
	}
	refresh(true);
	return cleanup;
}
/**
* Automatically updates the position of the floating element when necessary.
* Should only be called when the floating element is mounted on the DOM or
* visible on the screen.
* @returns cleanup function that should be invoked when the floating element is
* removed from the DOM or hidden from the screen.
* @see https://floating-ui.com/docs/autoUpdate
*/
function autoUpdate(reference, floating, update, options) {
	if (options === void 0) options = {};
	const { ancestorScroll = true, ancestorResize = true, elementResize = typeof ResizeObserver === "function", layoutShift = typeof IntersectionObserver === "function", animationFrame = false } = options;
	const referenceEl = unwrapElement(reference);
	const ancestors = ancestorScroll || ancestorResize ? [...referenceEl ? getOverflowAncestors(referenceEl) : [], ...getOverflowAncestors(floating)] : [];
	ancestors.forEach((ancestor) => {
		ancestorScroll && ancestor.addEventListener("scroll", update, { passive: true });
		ancestorResize && ancestor.addEventListener("resize", update);
	});
	const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update) : null;
	let reobserveFrame = -1;
	let resizeObserver = null;
	if (elementResize) {
		resizeObserver = new ResizeObserver((_ref) => {
			let [firstEntry] = _ref;
			if (firstEntry && firstEntry.target === referenceEl && resizeObserver) {
				resizeObserver.unobserve(floating);
				cancelAnimationFrame(reobserveFrame);
				reobserveFrame = requestAnimationFrame(() => {
					var _resizeObserver;
					(_resizeObserver = resizeObserver) == null || _resizeObserver.observe(floating);
				});
			}
			update();
		});
		if (referenceEl && !animationFrame) resizeObserver.observe(referenceEl);
		resizeObserver.observe(floating);
	}
	let frameId;
	let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
	if (animationFrame) frameLoop();
	function frameLoop() {
		const nextRefRect = getBoundingClientRect(reference);
		if (prevRefRect && !rectsAreEqual(prevRefRect, nextRefRect)) update();
		prevRefRect = nextRefRect;
		frameId = requestAnimationFrame(frameLoop);
	}
	update();
	return () => {
		var _resizeObserver2;
		ancestors.forEach((ancestor) => {
			ancestorScroll && ancestor.removeEventListener("scroll", update);
			ancestorResize && ancestor.removeEventListener("resize", update);
		});
		cleanupIo?.();
		(_resizeObserver2 = resizeObserver) == null || _resizeObserver2.disconnect();
		resizeObserver = null;
		if (animationFrame) cancelAnimationFrame(frameId);
	};
}
/**
* Resolves with an object of overflow side offsets that determine how much the
* element is overflowing a given clipping boundary on each side.
* - positive = overflowing the boundary by that number of pixels
* - negative = how many pixels left before it will overflow
* - 0 = lies flush with the boundary
* @see https://floating-ui.com/docs/detectOverflow
*/
var detectOverflow = detectOverflow$1;
/**
* Modifies the placement by translating the floating element along the
* specified axes.
* A number (shorthand for `mainAxis` or distance), or an axes configuration
* object may be passed.
* @see https://floating-ui.com/docs/offset
*/
var offset$1 = offset$2;
/**
* Optimizes the visibility of the floating element by choosing the placement
* that has the most space available automatically, without needing to specify a
* preferred placement. Alternative to `flip`.
* @see https://floating-ui.com/docs/autoPlacement
*/
var autoPlacement$1 = autoPlacement$2;
/**
* Optimizes the visibility of the floating element by shifting it in order to
* keep it in view when it will overflow the clipping boundary.
* @see https://floating-ui.com/docs/shift
*/
var shift$1 = shift$2;
/**
* Optimizes the visibility of the floating element by flipping the `placement`
* in order to keep it in view when the preferred placement(s) will overflow the
* clipping boundary. Alternative to `autoPlacement`.
* @see https://floating-ui.com/docs/flip
*/
var flip$1 = flip$2;
/**
* Provides data that allows you to change the size of the floating element —
* for instance, prevent it from overflowing the clipping boundary or match the
* width of the reference element.
* @see https://floating-ui.com/docs/size
*/
var size$1 = size$2;
/**
* Provides data to hide the floating element in applicable situations, such as
* when it is not in the same clipping context as the reference element.
* @see https://floating-ui.com/docs/hide
*/
var hide$1 = hide$2;
/**
* Provides data to position an inner element of the floating element so that it
* appears centered to the reference element.
* @see https://floating-ui.com/docs/arrow
*/
var arrow$2 = arrow$3;
/**
* Provides improved positioning for inline reference elements that can span
* over multiple lines, such as hyperlinks or range selections.
* @see https://floating-ui.com/docs/inline
*/
var inline$1 = inline$2;
/**
* Built-in `limiter` that will stop `shift()` at a certain point.
*/
var limitShift$1 = limitShift$2;
/**
* Computes the `x` and `y` coordinates that will place the floating element
* next to a given reference element.
*/
var computePosition = (reference, floating, options) => {
	const cache = /* @__PURE__ */ new Map();
	const mergedOptions = {
		platform,
		...options
	};
	const platformWithCache = {
		...mergedOptions.platform,
		_c: cache
	};
	return computePosition$1(reference, floating, {
		...mergedOptions,
		platform: platformWithCache
	});
};

//#endregion
//#region node_modules/@floating-ui/react-dom/dist/floating-ui.react-dom.mjs
var index = typeof document !== "undefined" ? import_react.useLayoutEffect : function noop() {};
function deepEqual(a, b) {
	if (a === b) return true;
	if (typeof a !== typeof b) return false;
	if (typeof a === "function" && a.toString() === b.toString()) return true;
	let length;
	let i;
	let keys;
	if (a && b && typeof a === "object") {
		if (Array.isArray(a)) {
			length = a.length;
			if (length !== b.length) return false;
			for (i = length; i-- !== 0;) if (!deepEqual(a[i], b[i])) return false;
			return true;
		}
		keys = Object.keys(a);
		length = keys.length;
		if (length !== Object.keys(b).length) return false;
		for (i = length; i-- !== 0;) if (!{}.hasOwnProperty.call(b, keys[i])) return false;
		for (i = length; i-- !== 0;) {
			const key = keys[i];
			if (key === "_owner" && a.$$typeof) continue;
			if (!deepEqual(a[key], b[key])) return false;
		}
		return true;
	}
	return a !== a && b !== b;
}
function getDPR(element) {
	if (typeof window === "undefined") return 1;
	return (element.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function roundByDPR(element, value) {
	const dpr = getDPR(element);
	return Math.round(value * dpr) / dpr;
}
function useLatestRef(value) {
	const ref = import_react.useRef(value);
	index(() => {
		ref.current = value;
	});
	return ref;
}
/**
* Provides data to position a floating element.
* @see https://floating-ui.com/docs/useFloating
*/
function useFloating$1(options) {
	if (options === void 0) options = {};
	const { placement = "bottom", strategy = "absolute", middleware = [], platform, elements: { reference: externalReference, floating: externalFloating } = {}, transform = true, whileElementsMounted, open } = options;
	const [data, setData] = import_react.useState({
		x: 0,
		y: 0,
		strategy,
		placement,
		middlewareData: {},
		isPositioned: false
	});
	const [latestMiddleware, setLatestMiddleware] = import_react.useState(middleware);
	if (!deepEqual(latestMiddleware, middleware)) setLatestMiddleware(middleware);
	const [_reference, _setReference] = import_react.useState(null);
	const [_floating, _setFloating] = import_react.useState(null);
	const setReference = import_react.useCallback((node) => {
		if (node !== referenceRef.current) {
			referenceRef.current = node;
			_setReference(node);
		}
	}, []);
	const setFloating = import_react.useCallback((node) => {
		if (node !== floatingRef.current) {
			floatingRef.current = node;
			_setFloating(node);
		}
	}, []);
	const referenceEl = externalReference || _reference;
	const floatingEl = externalFloating || _floating;
	const referenceRef = import_react.useRef(null);
	const floatingRef = import_react.useRef(null);
	const dataRef = import_react.useRef(data);
	const hasWhileElementsMounted = whileElementsMounted != null;
	const whileElementsMountedRef = useLatestRef(whileElementsMounted);
	const platformRef = useLatestRef(platform);
	const openRef = useLatestRef(open);
	const update = import_react.useCallback(() => {
		if (!referenceRef.current || !floatingRef.current) return;
		const config = {
			placement,
			strategy,
			middleware: latestMiddleware
		};
		if (platformRef.current) config.platform = platformRef.current;
		computePosition(referenceRef.current, floatingRef.current, config).then((data) => {
			const fullData = {
				...data,
				isPositioned: openRef.current !== false
			};
			if (isMountedRef.current && !deepEqual(dataRef.current, fullData)) {
				dataRef.current = fullData;
				import_react_dom.flushSync(() => {
					setData(fullData);
				});
			}
		});
	}, [
		latestMiddleware,
		placement,
		strategy,
		platformRef,
		openRef
	]);
	index(() => {
		if (open === false && dataRef.current.isPositioned) {
			dataRef.current.isPositioned = false;
			setData((data) => ({
				...data,
				isPositioned: false
			}));
		}
	}, [open]);
	const isMountedRef = import_react.useRef(false);
	index(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);
	index(() => {
		if (referenceEl) referenceRef.current = referenceEl;
		if (floatingEl) floatingRef.current = floatingEl;
		if (referenceEl && floatingEl) {
			if (whileElementsMountedRef.current) return whileElementsMountedRef.current(referenceEl, floatingEl, update);
			update();
		}
	}, [
		referenceEl,
		floatingEl,
		update,
		whileElementsMountedRef,
		hasWhileElementsMounted
	]);
	const refs = import_react.useMemo(() => ({
		reference: referenceRef,
		floating: floatingRef,
		setReference,
		setFloating
	}), [setReference, setFloating]);
	const elements = import_react.useMemo(() => ({
		reference: referenceEl,
		floating: floatingEl
	}), [referenceEl, floatingEl]);
	const floatingStyles = import_react.useMemo(() => {
		const initialStyles = {
			position: strategy,
			left: 0,
			top: 0
		};
		if (!elements.floating) return initialStyles;
		const x = roundByDPR(elements.floating, data.x);
		const y = roundByDPR(elements.floating, data.y);
		if (transform) return {
			...initialStyles,
			transform: "translate(" + x + "px, " + y + "px)",
			...getDPR(elements.floating) >= 1.5 && { willChange: "transform" }
		};
		return {
			position: strategy,
			left: x,
			top: y
		};
	}, [
		strategy,
		transform,
		elements.floating,
		data.x,
		data.y
	]);
	return import_react.useMemo(() => ({
		...data,
		update,
		refs,
		elements,
		floatingStyles
	}), [
		data,
		update,
		refs,
		elements,
		floatingStyles
	]);
}
/**
* Provides data to position an inner element of the floating element so that it
* appears centered to the reference element.
* This wraps the core `arrow` middleware to allow React refs as the element.
* @see https://floating-ui.com/docs/arrow
*/
var arrow$1 = (options) => {
	function isRef(value) {
		return {}.hasOwnProperty.call(value, "current");
	}
	return {
		name: "arrow",
		options,
		fn(state) {
			const { element, padding } = typeof options === "function" ? options(state) : options;
			if (element && isRef(element)) {
				if (element.current != null) return arrow$2({
					element: element.current,
					padding
				}).fn(state);
				return {};
			}
			if (element) return arrow$2({
				element,
				padding
			}).fn(state);
			return {};
		}
	};
};
/**
* Modifies the placement by translating the floating element along the
* specified axes.
* A number (shorthand for `mainAxis` or distance), or an axes configuration
* object may be passed.
* @see https://floating-ui.com/docs/offset
*/
var offset = (options, deps) => ({
	...offset$1(options),
	options: [options, deps]
});
/**
* Optimizes the visibility of the floating element by shifting it in order to
* keep it in view when it will overflow the clipping boundary.
* @see https://floating-ui.com/docs/shift
*/
var shift = (options, deps) => ({
	...shift$1(options),
	options: [options, deps]
});
/**
* Built-in `limiter` that will stop `shift()` at a certain point.
*/
var limitShift = (options, deps) => ({
	...limitShift$1(options),
	options: [options, deps]
});
/**
* Optimizes the visibility of the floating element by flipping the `placement`
* in order to keep it in view when the preferred placement(s) will overflow the
* clipping boundary. Alternative to `autoPlacement`.
* @see https://floating-ui.com/docs/flip
*/
var flip = (options, deps) => ({
	...flip$1(options),
	options: [options, deps]
});
/**
* Provides data that allows you to change the size of the floating element —
* for instance, prevent it from overflowing the clipping boundary or match the
* width of the reference element.
* @see https://floating-ui.com/docs/size
*/
var size = (options, deps) => ({
	...size$1(options),
	options: [options, deps]
});
/**
* Optimizes the visibility of the floating element by choosing the placement
* that has the most space available automatically, without needing to specify a
* preferred placement. Alternative to `flip`.
* @see https://floating-ui.com/docs/autoPlacement
*/
var autoPlacement = (options, deps) => ({
	...autoPlacement$1(options),
	options: [options, deps]
});
/**
* Provides data to hide the floating element in applicable situations, such as
* when it is not in the same clipping context as the reference element.
* @see https://floating-ui.com/docs/hide
*/
var hide = (options, deps) => ({
	...hide$1(options),
	options: [options, deps]
});
/**
* Provides improved positioning for inline reference elements that can span
* over multiple lines, such as hyperlinks or range selections.
* @see https://floating-ui.com/docs/inline
*/
var inline = (options, deps) => ({
	...inline$1(options),
	options: [options, deps]
});
/**
* Provides data to position an inner element of the floating element so that it
* appears centered to the reference element.
* This wraps the core `arrow` middleware to allow React refs as the element.
* @see https://floating-ui.com/docs/arrow
*/
var arrow = (options, deps) => ({
	...arrow$1(options),
	options: [options, deps]
});

//#endregion
//#region node_modules/@floating-ui/react/dist/floating-ui.react.mjs
/**
* Merges an array of refs into a single memoized callback ref or `null`.
* @see https://floating-ui.com/docs/react-utils#usemergerefs
*/
function useMergeRefs(refs) {
	const cleanupRef = import_react.useRef(void 0);
	const refEffect = import_react.useCallback((instance) => {
		const cleanups = refs.map((ref) => {
			if (ref == null) return;
			if (typeof ref === "function") {
				const refCallback = ref;
				const refCleanup = refCallback(instance);
				return typeof refCleanup === "function" ? refCleanup : () => {
					refCallback(null);
				};
			}
			ref.current = instance;
			return () => {
				ref.current = null;
			};
		});
		return () => {
			cleanups.forEach((refCleanup) => refCleanup == null ? void 0 : refCleanup());
		};
	}, refs);
	return import_react.useMemo(() => {
		if (refs.every((ref) => ref == null)) return null;
		return (value) => {
			if (cleanupRef.current) {
				cleanupRef.current();
				cleanupRef.current = void 0;
			}
			if (value != null) cleanupRef.current = refEffect(value);
		};
	}, refs);
}
function sortByDocumentPosition(a, b) {
	const position = a.compareDocumentPosition(b);
	if (position & Node.DOCUMENT_POSITION_FOLLOWING || position & Node.DOCUMENT_POSITION_CONTAINED_BY) return -1;
	if (position & Node.DOCUMENT_POSITION_PRECEDING || position & Node.DOCUMENT_POSITION_CONTAINS) return 1;
	return 0;
}
var FloatingListContext = /* @__PURE__ */ import_react.createContext({
	register: () => {},
	unregister: () => {},
	map: /* @__PURE__ */ new Map(),
	elementsRef: { current: [] }
});
/**
* Provides context for a list of items within the floating element.
* @see https://floating-ui.com/docs/FloatingList
*/
function FloatingList(props) {
	const { children, elementsRef, labelsRef } = props;
	const [nodes, setNodes] = import_react.useState(() => /* @__PURE__ */ new Set());
	const register = import_react.useCallback((node) => {
		setNodes((prevSet) => new Set(prevSet).add(node));
	}, []);
	const unregister = import_react.useCallback((node) => {
		setNodes((prevSet) => {
			const set = new Set(prevSet);
			set.delete(node);
			return set;
		});
	}, []);
	const map = import_react.useMemo(() => {
		const newMap = /* @__PURE__ */ new Map();
		Array.from(nodes.keys()).sort(sortByDocumentPosition).forEach((node, index) => {
			newMap.set(node, index);
		});
		return newMap;
	}, [nodes]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatingListContext.Provider, {
		value: import_react.useMemo(() => ({
			register,
			unregister,
			map,
			elementsRef,
			labelsRef
		}), [
			register,
			unregister,
			map,
			elementsRef,
			labelsRef
		]),
		children
	});
}
/**
* Used to register a list item and its index (DOM position) in the
* `FloatingList`.
* @see https://floating-ui.com/docs/FloatingList#uselistitem
*/
function useListItem(props) {
	if (props === void 0) props = {};
	const { label } = props;
	const { register, unregister, map, elementsRef, labelsRef } = import_react.useContext(FloatingListContext);
	const [index, setIndex] = import_react.useState(null);
	const componentRef = import_react.useRef(null);
	const ref = import_react.useCallback((node) => {
		componentRef.current = node;
		if (index !== null) {
			elementsRef.current[index] = node;
			if (labelsRef) {
				var _node$textContent;
				const isLabelDefined = label !== void 0;
				labelsRef.current[index] = isLabelDefined ? label : (_node$textContent = node == null ? void 0 : node.textContent) != null ? _node$textContent : null;
			}
		}
	}, [
		index,
		elementsRef,
		labelsRef,
		label
	]);
	index$1(() => {
		const node = componentRef.current;
		if (node) {
			register(node);
			return () => {
				unregister(node);
			};
		}
	}, [register, unregister]);
	index$1(() => {
		const index = componentRef.current ? map.get(componentRef.current) : null;
		if (index != null) setIndex(index);
	}, [map]);
	return import_react.useMemo(() => ({
		ref,
		index: index == null ? -1 : index
	}), [index, ref]);
}
var FOCUSABLE_ATTRIBUTE = "data-floating-ui-focusable";
var ACTIVE_KEY = "active";
var SELECTED_KEY = "selected";
var ARROW_LEFT = "ArrowLeft";
var ARROW_RIGHT = "ArrowRight";
var ARROW_UP = "ArrowUp";
var ARROW_DOWN = "ArrowDown";
function renderJsx(render, computedProps) {
	if (typeof render === "function") return render(computedProps);
	if (render) return /* @__PURE__ */ import_react.cloneElement(render, computedProps);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...computedProps });
}
var CompositeContext = /* @__PURE__ */ import_react.createContext({
	activeIndex: 0,
	onNavigate: () => {}
});
var horizontalKeys = [ARROW_LEFT, ARROW_RIGHT];
var verticalKeys = [ARROW_UP, ARROW_DOWN];
var allKeys = [...horizontalKeys, ...verticalKeys];
/**
* Creates a single tab stop whose items are navigated by arrow keys, which
* provides list navigation outside of floating element contexts.
*
* This is useful to enable navigation of a list of items that aren’t part of a
* floating element. A menubar is an example of a composite, with each reference
* element being an item.
* @see https://floating-ui.com/docs/Composite
*/
var Composite = /* @__PURE__ */ import_react.forwardRef(function Composite(props, forwardedRef) {
	const { render, orientation = "both", loop = true, rtl = false, cols = 1, disabledIndices, activeIndex: externalActiveIndex, onNavigate: externalSetActiveIndex, itemSizes, dense = false, ...domProps } = props;
	const [internalActiveIndex, internalSetActiveIndex] = import_react.useState(0);
	const activeIndex = externalActiveIndex != null ? externalActiveIndex : internalActiveIndex;
	const onNavigate = useEffectEvent(externalSetActiveIndex != null ? externalSetActiveIndex : internalSetActiveIndex);
	const elementsRef = import_react.useRef([]);
	const renderElementProps = render && typeof render !== "function" ? render.props : {};
	const contextValue = import_react.useMemo(() => ({
		activeIndex,
		onNavigate
	}), [activeIndex, onNavigate]);
	const isGrid = cols > 1;
	function handleKeyDown(event) {
		if (!allKeys.includes(event.key)) return;
		let nextIndex = activeIndex;
		const minIndex = getMinListIndex(elementsRef, disabledIndices);
		const maxIndex = getMaxListIndex(elementsRef, disabledIndices);
		const horizontalEndKey = rtl ? ARROW_LEFT : ARROW_RIGHT;
		const horizontalStartKey = rtl ? ARROW_RIGHT : ARROW_LEFT;
		if (isGrid) {
			const sizes = itemSizes || Array.from({ length: elementsRef.current.length }, () => ({
				width: 1,
				height: 1
			}));
			const cellMap = createGridCellMap(sizes, cols, dense);
			const minGridIndex = cellMap.findIndex((index) => index != null && !isListIndexDisabled(elementsRef, index, disabledIndices));
			const maxGridIndex = cellMap.reduce((foundIndex, index, cellIndex) => index != null && !isListIndexDisabled(elementsRef, index, disabledIndices) ? cellIndex : foundIndex, -1);
			const maybeNextIndex = cellMap[getGridNavigatedIndex({ current: cellMap.map((itemIndex) => itemIndex ? elementsRef.current[itemIndex] : null) }, {
				event,
				orientation,
				loop,
				rtl,
				cols,
				disabledIndices: getGridCellIndices([...(typeof disabledIndices !== "function" ? disabledIndices : null) || elementsRef.current.map((_, index) => isListIndexDisabled(elementsRef, index, disabledIndices) ? index : void 0), void 0], cellMap),
				minIndex: minGridIndex,
				maxIndex: maxGridIndex,
				prevIndex: getGridCellIndexOfCorner(activeIndex > maxIndex ? minIndex : activeIndex, sizes, cellMap, cols, event.key === ARROW_DOWN ? "bl" : event.key === horizontalEndKey ? "tr" : "tl")
			})];
			if (maybeNextIndex != null) nextIndex = maybeNextIndex;
		}
		const toEndKeys = {
			horizontal: [horizontalEndKey],
			vertical: [ARROW_DOWN],
			both: [horizontalEndKey, ARROW_DOWN]
		}[orientation];
		const toStartKeys = {
			horizontal: [horizontalStartKey],
			vertical: [ARROW_UP],
			both: [horizontalStartKey, ARROW_UP]
		}[orientation];
		const preventedKeys = isGrid ? allKeys : {
			horizontal: horizontalKeys,
			vertical: verticalKeys,
			both: allKeys
		}[orientation];
		if (nextIndex === activeIndex && [...toEndKeys, ...toStartKeys].includes(event.key)) if (loop && nextIndex === maxIndex && toEndKeys.includes(event.key)) nextIndex = minIndex;
		else if (loop && nextIndex === minIndex && toStartKeys.includes(event.key)) nextIndex = maxIndex;
		else nextIndex = findNonDisabledListIndex(elementsRef, {
			startingIndex: nextIndex,
			decrement: toStartKeys.includes(event.key),
			disabledIndices
		});
		if (nextIndex !== activeIndex && !isIndexOutOfListBounds(elementsRef, nextIndex)) {
			var _elementsRef$current$;
			event.stopPropagation();
			if (preventedKeys.includes(event.key)) event.preventDefault();
			onNavigate(nextIndex);
			(_elementsRef$current$ = elementsRef.current[nextIndex]) == null || _elementsRef$current$.focus();
		}
	}
	const computedProps = {
		...domProps,
		...renderElementProps,
		ref: forwardedRef,
		"aria-orientation": orientation === "both" ? void 0 : orientation,
		onKeyDown(e) {
			domProps.onKeyDown == null || domProps.onKeyDown(e);
			renderElementProps.onKeyDown == null || renderElementProps.onKeyDown(e);
			handleKeyDown(e);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompositeContext.Provider, {
		value: contextValue,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatingList, {
			elementsRef,
			children: renderJsx(render, computedProps)
		})
	});
});
/**
* @see https://floating-ui.com/docs/Composite
*/
var CompositeItem = /* @__PURE__ */ import_react.forwardRef(function CompositeItem(props, forwardedRef) {
	const { render, ...domProps } = props;
	const renderElementProps = render && typeof render !== "function" ? render.props : {};
	const { activeIndex, onNavigate } = import_react.useContext(CompositeContext);
	const { ref, index } = useListItem();
	const mergedRef = useMergeRefs([
		ref,
		forwardedRef,
		renderElementProps.ref
	]);
	const isActive = activeIndex === index;
	return renderJsx(render, {
		...domProps,
		...renderElementProps,
		ref: mergedRef,
		tabIndex: isActive ? 0 : -1,
		"data-active": isActive ? "" : void 0,
		onFocus(e) {
			domProps.onFocus == null || domProps.onFocus(e);
			renderElementProps.onFocus == null || renderElementProps.onFocus(e);
			onNavigate(index);
		}
	});
});
var SafeReact = { ...import_react };
var serverHandoffComplete = false;
var count = 0;
var genId = () => "floating-ui-" + Math.random().toString(36).slice(2, 6) + count++;
function useFloatingId() {
	const [id, setId] = import_react.useState(() => serverHandoffComplete ? genId() : void 0);
	index$1(() => {
		if (id == null) setId(genId());
	}, []);
	import_react.useEffect(() => {
		serverHandoffComplete = true;
	}, []);
	return id;
}
/**
* Uses React 18's built-in `useId()` when available, or falls back to a
* slightly less performant (requiring a double render) implementation for
* earlier React versions.
* @see https://floating-ui.com/docs/react-utils#useid
*/
var useId = SafeReact.useId || useFloatingId;
var devMessageSet;
devMessageSet = /* @__PURE__ */ new Set();
function warn() {
	var _devMessageSet;
	for (var _len = arguments.length, messages = new Array(_len), _key = 0; _key < _len; _key++) messages[_key] = arguments[_key];
	const message = "Floating UI: " + messages.join(" ");
	if (!((_devMessageSet = devMessageSet) != null && _devMessageSet.has(message))) {
		var _devMessageSet2;
		(_devMessageSet2 = devMessageSet) == null || _devMessageSet2.add(message);
		console.warn(message);
	}
}
function error() {
	var _devMessageSet3;
	for (var _len2 = arguments.length, messages = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) messages[_key2] = arguments[_key2];
	const message = "Floating UI: " + messages.join(" ");
	if (!((_devMessageSet3 = devMessageSet) != null && _devMessageSet3.has(message))) {
		var _devMessageSet4;
		(_devMessageSet4 = devMessageSet) == null || _devMessageSet4.add(message);
		console.error(message);
	}
}
/**
* Renders a pointing arrow triangle.
* @see https://floating-ui.com/docs/FloatingArrow
*/
var FloatingArrow = /* @__PURE__ */ import_react.forwardRef(function FloatingArrow(props, ref) {
	const { context: { placement, elements: { floating }, middlewareData: { arrow, shift } }, width = 14, height = 7, tipRadius = 0, strokeWidth = 0, staticOffset, stroke, d, style: { transform, ...restStyle } = {}, ...rest } = props;
	if (!ref) warn("The `ref` prop is required for `FloatingArrow`.");
	const clipPathId = useId();
	const [isRTL, setIsRTL] = import_react.useState(false);
	index$1(() => {
		if (!floating) return;
		if (getComputedStyle$1(floating).direction === "rtl") setIsRTL(true);
	}, [floating]);
	if (!floating) return null;
	const [side, alignment] = placement.split("-");
	const isVerticalSide = side === "top" || side === "bottom";
	let computedStaticOffset = staticOffset;
	if (isVerticalSide && shift != null && shift.x || !isVerticalSide && shift != null && shift.y) computedStaticOffset = null;
	const computedStrokeWidth = strokeWidth * 2;
	const halfStrokeWidth = computedStrokeWidth / 2;
	const svgX = width / 2 * (tipRadius / -8 + 1);
	const svgY = height / 2 * tipRadius / 4;
	const isCustomShape = !!d;
	const yOffsetProp = computedStaticOffset && alignment === "end" ? "bottom" : "top";
	let xOffsetProp = computedStaticOffset && alignment === "end" ? "right" : "left";
	if (computedStaticOffset && isRTL) xOffsetProp = alignment === "end" ? "left" : "right";
	const arrowX = (arrow == null ? void 0 : arrow.x) != null ? computedStaticOffset || arrow.x : "";
	const arrowY = (arrow == null ? void 0 : arrow.y) != null ? computedStaticOffset || arrow.y : "";
	const dValue = d || "M0,0" + (" H" + width) + (" L" + (width - svgX) + "," + (height - svgY)) + (" Q" + width / 2 + "," + height + " " + svgX + "," + (height - svgY)) + " Z";
	const rotation = {
		top: isCustomShape ? "rotate(180deg)" : "",
		left: isCustomShape ? "rotate(90deg)" : "rotate(-90deg)",
		bottom: isCustomShape ? "" : "rotate(180deg)",
		right: isCustomShape ? "rotate(-90deg)" : "rotate(90deg)"
	}[side];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		...rest,
		"aria-hidden": true,
		ref,
		width: isCustomShape ? width : width + computedStrokeWidth,
		height: width,
		viewBox: "0 0 " + width + " " + (height > width ? height : width),
		style: {
			position: "absolute",
			pointerEvents: "none",
			[xOffsetProp]: arrowX,
			[yOffsetProp]: arrowY,
			[side]: isVerticalSide || isCustomShape ? "100%" : "calc(100% - " + computedStrokeWidth / 2 + "px)",
			transform: [rotation, transform].filter((t) => !!t).join(" "),
			...restStyle
		},
		children: [
			computedStrokeWidth > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				clipPath: "url(#" + clipPathId + ")",
				fill: "none",
				stroke,
				strokeWidth: computedStrokeWidth + (d ? 0 : 1),
				d: dValue
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				stroke: computedStrokeWidth && !d ? rest.fill : "none",
				d: dValue
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("clipPath", {
				id: clipPathId,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: -halfStrokeWidth,
					y: halfStrokeWidth * (isCustomShape ? -1 : 1),
					width: width + computedStrokeWidth,
					height: width
				})
			})
		]
	});
});
function createEventEmitter() {
	const map = /* @__PURE__ */ new Map();
	return {
		emit(event, data) {
			var _map$get;
			(_map$get = map.get(event)) == null || _map$get.forEach((listener) => listener(data));
		},
		on(event, listener) {
			if (!map.has(event)) map.set(event, /* @__PURE__ */ new Set());
			map.get(event).add(listener);
		},
		off(event, listener) {
			var _map$get2;
			(_map$get2 = map.get(event)) == null || _map$get2.delete(listener);
		}
	};
}
var FloatingNodeContext = /* @__PURE__ */ import_react.createContext(null);
var FloatingTreeContext = /* @__PURE__ */ import_react.createContext(null);
/**
* Returns the parent node id for nested floating elements, if available.
* Returns `null` for top-level floating elements.
*/
var useFloatingParentNodeId = () => {
	var _React$useContext;
	return ((_React$useContext = import_react.useContext(FloatingNodeContext)) == null ? void 0 : _React$useContext.id) || null;
};
/**
* Returns the nearest floating tree context, if available.
*/
var useFloatingTree = () => import_react.useContext(FloatingTreeContext);
/**
* Registers a node into the `FloatingTree`, returning its id.
* @see https://floating-ui.com/docs/FloatingTree
*/
function useFloatingNodeId(customParentId) {
	const id = useId();
	const tree = useFloatingTree();
	const reactParentId = useFloatingParentNodeId();
	const parentId = customParentId || reactParentId;
	index$1(() => {
		if (!id) return;
		const node = {
			id,
			parentId
		};
		tree?.addNode(node);
		return () => {
			tree?.removeNode(node);
		};
	}, [
		tree,
		id,
		parentId
	]);
	return id;
}
/**
* Provides parent node context for nested floating elements.
* @see https://floating-ui.com/docs/FloatingTree
*/
function FloatingNode(props) {
	const { children, id } = props;
	const parentId = useFloatingParentNodeId();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatingNodeContext.Provider, {
		value: import_react.useMemo(() => ({
			id,
			parentId
		}), [id, parentId]),
		children
	});
}
/**
* Provides context for nested floating elements when they are not children of
* each other on the DOM.
* This is not necessary in all cases, except when there must be explicit communication between parent and child floating elements. It is necessary for:
* - The `bubbles` option in the `useDismiss()` Hook
* - Nested virtual list navigation
* - Nested floating elements that each open on hover
* - Custom communication between parent and child floating elements
* @see https://floating-ui.com/docs/FloatingTree
*/
function FloatingTree(props) {
	const { children } = props;
	const nodesRef = import_react.useRef([]);
	const addNode = import_react.useCallback((node) => {
		nodesRef.current = [...nodesRef.current, node];
	}, []);
	const removeNode = import_react.useCallback((node) => {
		nodesRef.current = nodesRef.current.filter((n) => n !== node);
	}, []);
	const [events] = import_react.useState(() => createEventEmitter());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatingTreeContext.Provider, {
		value: import_react.useMemo(() => ({
			nodesRef,
			addNode,
			removeNode,
			events
		}), [
			addNode,
			removeNode,
			events
		]),
		children
	});
}
function createAttribute(name) {
	return "data-floating-ui-" + name;
}
function clearTimeoutIfSet(timeoutRef) {
	if (timeoutRef.current !== -1) {
		clearTimeout(timeoutRef.current);
		timeoutRef.current = -1;
	}
}
var safePolygonIdentifier = /* @__PURE__ */ createAttribute("safe-polygon");
function getDelay(value, prop, pointerType) {
	if (pointerType && !isMouseLikePointerType(pointerType)) return 0;
	if (typeof value === "number") return value;
	if (typeof value === "function") {
		const result = value();
		if (typeof result === "number") return result;
		return result == null ? void 0 : result[prop];
	}
	return value == null ? void 0 : value[prop];
}
function getRestMs(value) {
	if (typeof value === "function") return value();
	return value;
}
/**
* Opens the floating element while hovering over the reference element, like
* CSS `:hover`.
* @see https://floating-ui.com/docs/useHover
*/
function useHover(context, props) {
	if (props === void 0) props = {};
	const { open, onOpenChange, dataRef, events, elements } = context;
	const { enabled = true, delay = 0, handleClose = null, mouseOnly = false, restMs = 0, move = true } = props;
	const tree = useFloatingTree();
	const parentId = useFloatingParentNodeId();
	const handleCloseRef = useLatestRef$1(handleClose);
	const delayRef = useLatestRef$1(delay);
	const openRef = useLatestRef$1(open);
	const restMsRef = useLatestRef$1(restMs);
	const pointerTypeRef = import_react.useRef();
	const timeoutRef = import_react.useRef(-1);
	const handlerRef = import_react.useRef();
	const restTimeoutRef = import_react.useRef(-1);
	const blockMouseMoveRef = import_react.useRef(true);
	const performedPointerEventsMutationRef = import_react.useRef(false);
	const unbindMouseMoveRef = import_react.useRef(() => {});
	const restTimeoutPendingRef = import_react.useRef(false);
	const isHoverOpen = useEffectEvent(() => {
		var _dataRef$current$open;
		const type = (_dataRef$current$open = dataRef.current.openEvent) == null ? void 0 : _dataRef$current$open.type;
		return (type == null ? void 0 : type.includes("mouse")) && type !== "mousedown";
	});
	import_react.useEffect(() => {
		if (!enabled) return;
		function onOpenChange(_ref) {
			let { open } = _ref;
			if (!open) {
				clearTimeoutIfSet(timeoutRef);
				clearTimeoutIfSet(restTimeoutRef);
				blockMouseMoveRef.current = true;
				restTimeoutPendingRef.current = false;
			}
		}
		events.on("openchange", onOpenChange);
		return () => {
			events.off("openchange", onOpenChange);
		};
	}, [enabled, events]);
	import_react.useEffect(() => {
		if (!enabled) return;
		if (!handleCloseRef.current) return;
		if (!open) return;
		function onLeave(event) {
			if (isHoverOpen()) onOpenChange(false, event, "hover");
		}
		const html = getDocument$1(elements.floating).documentElement;
		html.addEventListener("mouseleave", onLeave);
		return () => {
			html.removeEventListener("mouseleave", onLeave);
		};
	}, [
		elements.floating,
		open,
		onOpenChange,
		enabled,
		handleCloseRef,
		isHoverOpen
	]);
	const closeWithDelay = import_react.useCallback(function(event, runElseBranch, reason) {
		if (runElseBranch === void 0) runElseBranch = true;
		if (reason === void 0) reason = "hover";
		const closeDelay = getDelay(delayRef.current, "close", pointerTypeRef.current);
		if (closeDelay && !handlerRef.current) {
			clearTimeoutIfSet(timeoutRef);
			timeoutRef.current = window.setTimeout(() => onOpenChange(false, event, reason), closeDelay);
		} else if (runElseBranch) {
			clearTimeoutIfSet(timeoutRef);
			onOpenChange(false, event, reason);
		}
	}, [delayRef, onOpenChange]);
	const cleanupMouseMoveHandler = useEffectEvent(() => {
		unbindMouseMoveRef.current();
		handlerRef.current = void 0;
	});
	const clearPointerEvents = useEffectEvent(() => {
		if (performedPointerEventsMutationRef.current) {
			const body = getDocument$1(elements.floating).body;
			body.style.pointerEvents = "";
			body.removeAttribute(safePolygonIdentifier);
			performedPointerEventsMutationRef.current = false;
		}
	});
	const isClickLikeOpenEvent = useEffectEvent(() => {
		return dataRef.current.openEvent ? ["click", "mousedown"].includes(dataRef.current.openEvent.type) : false;
	});
	import_react.useEffect(() => {
		if (!enabled) return;
		function onReferenceMouseEnter(event) {
			clearTimeoutIfSet(timeoutRef);
			blockMouseMoveRef.current = false;
			if (mouseOnly && !isMouseLikePointerType(pointerTypeRef.current) || getRestMs(restMsRef.current) > 0 && !getDelay(delayRef.current, "open")) return;
			const openDelay = getDelay(delayRef.current, "open", pointerTypeRef.current);
			if (openDelay) timeoutRef.current = window.setTimeout(() => {
				if (!openRef.current) onOpenChange(true, event, "hover");
			}, openDelay);
			else if (!open) onOpenChange(true, event, "hover");
		}
		function onReferenceMouseLeave(event) {
			if (isClickLikeOpenEvent()) {
				clearPointerEvents();
				return;
			}
			unbindMouseMoveRef.current();
			const doc = getDocument$1(elements.floating);
			clearTimeoutIfSet(restTimeoutRef);
			restTimeoutPendingRef.current = false;
			if (handleCloseRef.current && dataRef.current.floatingContext) {
				if (!open) clearTimeoutIfSet(timeoutRef);
				handlerRef.current = handleCloseRef.current({
					...dataRef.current.floatingContext,
					tree,
					x: event.clientX,
					y: event.clientY,
					onClose() {
						clearPointerEvents();
						cleanupMouseMoveHandler();
						if (!isClickLikeOpenEvent()) closeWithDelay(event, true, "safe-polygon");
					}
				});
				const handler = handlerRef.current;
				doc.addEventListener("mousemove", handler);
				unbindMouseMoveRef.current = () => {
					doc.removeEventListener("mousemove", handler);
				};
				return;
			}
			if (pointerTypeRef.current === "touch" ? !contains$1(elements.floating, event.relatedTarget) : true) closeWithDelay(event);
		}
		function onScrollMouseLeave(event) {
			if (isClickLikeOpenEvent()) return;
			if (!dataRef.current.floatingContext) return;
			handleCloseRef.current == null || handleCloseRef.current({
				...dataRef.current.floatingContext,
				tree,
				x: event.clientX,
				y: event.clientY,
				onClose() {
					clearPointerEvents();
					cleanupMouseMoveHandler();
					if (!isClickLikeOpenEvent()) closeWithDelay(event);
				}
			})(event);
		}
		function onFloatingMouseEnter() {
			clearTimeoutIfSet(timeoutRef);
		}
		function onFloatingMouseLeave(event) {
			if (!isClickLikeOpenEvent()) closeWithDelay(event, false);
		}
		if (isElement(elements.domReference)) {
			const reference = elements.domReference;
			const floating = elements.floating;
			if (open) reference.addEventListener("mouseleave", onScrollMouseLeave);
			if (move) reference.addEventListener("mousemove", onReferenceMouseEnter, { once: true });
			reference.addEventListener("mouseenter", onReferenceMouseEnter);
			reference.addEventListener("mouseleave", onReferenceMouseLeave);
			if (floating) {
				floating.addEventListener("mouseleave", onScrollMouseLeave);
				floating.addEventListener("mouseenter", onFloatingMouseEnter);
				floating.addEventListener("mouseleave", onFloatingMouseLeave);
			}
			return () => {
				if (open) reference.removeEventListener("mouseleave", onScrollMouseLeave);
				if (move) reference.removeEventListener("mousemove", onReferenceMouseEnter);
				reference.removeEventListener("mouseenter", onReferenceMouseEnter);
				reference.removeEventListener("mouseleave", onReferenceMouseLeave);
				if (floating) {
					floating.removeEventListener("mouseleave", onScrollMouseLeave);
					floating.removeEventListener("mouseenter", onFloatingMouseEnter);
					floating.removeEventListener("mouseleave", onFloatingMouseLeave);
				}
			};
		}
	}, [
		elements,
		enabled,
		context,
		mouseOnly,
		move,
		closeWithDelay,
		cleanupMouseMoveHandler,
		clearPointerEvents,
		onOpenChange,
		open,
		openRef,
		tree,
		delayRef,
		handleCloseRef,
		dataRef,
		isClickLikeOpenEvent,
		restMsRef
	]);
	index$1(() => {
		var _handleCloseRef$curre;
		if (!enabled) return;
		if (open && (_handleCloseRef$curre = handleCloseRef.current) != null && (_handleCloseRef$curre = _handleCloseRef$curre.__options) != null && _handleCloseRef$curre.blockPointerEvents && isHoverOpen()) {
			performedPointerEventsMutationRef.current = true;
			const floatingEl = elements.floating;
			if (isElement(elements.domReference) && floatingEl) {
				var _tree$nodesRef$curren;
				const body = getDocument$1(elements.floating).body;
				body.setAttribute(safePolygonIdentifier, "");
				const ref = elements.domReference;
				const parentFloating = tree == null || (_tree$nodesRef$curren = tree.nodesRef.current.find((node) => node.id === parentId)) == null || (_tree$nodesRef$curren = _tree$nodesRef$curren.context) == null ? void 0 : _tree$nodesRef$curren.elements.floating;
				if (parentFloating) parentFloating.style.pointerEvents = "";
				body.style.pointerEvents = "none";
				ref.style.pointerEvents = "auto";
				floatingEl.style.pointerEvents = "auto";
				return () => {
					body.style.pointerEvents = "";
					ref.style.pointerEvents = "";
					floatingEl.style.pointerEvents = "";
				};
			}
		}
	}, [
		enabled,
		open,
		parentId,
		elements,
		tree,
		handleCloseRef,
		isHoverOpen
	]);
	index$1(() => {
		if (!open) {
			pointerTypeRef.current = void 0;
			restTimeoutPendingRef.current = false;
			cleanupMouseMoveHandler();
			clearPointerEvents();
		}
	}, [
		open,
		cleanupMouseMoveHandler,
		clearPointerEvents
	]);
	import_react.useEffect(() => {
		return () => {
			cleanupMouseMoveHandler();
			clearTimeoutIfSet(timeoutRef);
			clearTimeoutIfSet(restTimeoutRef);
			clearPointerEvents();
		};
	}, [
		enabled,
		elements.domReference,
		cleanupMouseMoveHandler,
		clearPointerEvents
	]);
	const reference = import_react.useMemo(() => {
		function setPointerRef(event) {
			pointerTypeRef.current = event.pointerType;
		}
		return {
			onPointerDown: setPointerRef,
			onPointerEnter: setPointerRef,
			onMouseMove(event) {
				const { nativeEvent } = event;
				function handleMouseMove() {
					if (!blockMouseMoveRef.current && !openRef.current) onOpenChange(true, nativeEvent, "hover");
				}
				if (mouseOnly && !isMouseLikePointerType(pointerTypeRef.current)) return;
				if (open || getRestMs(restMsRef.current) === 0) return;
				if (restTimeoutPendingRef.current && event.movementX ** 2 + event.movementY ** 2 < 2) return;
				clearTimeoutIfSet(restTimeoutRef);
				if (pointerTypeRef.current === "touch") handleMouseMove();
				else {
					restTimeoutPendingRef.current = true;
					restTimeoutRef.current = window.setTimeout(handleMouseMove, getRestMs(restMsRef.current));
				}
			}
		};
	}, [
		mouseOnly,
		onOpenChange,
		open,
		openRef,
		restMsRef
	]);
	return import_react.useMemo(() => enabled ? { reference } : {}, [enabled, reference]);
}
var NOOP = () => {};
var FloatingDelayGroupContext = /* @__PURE__ */ import_react.createContext({
	delay: 0,
	initialDelay: 0,
	timeoutMs: 0,
	currentId: null,
	setCurrentId: NOOP,
	setState: NOOP,
	isInstantPhase: false
});
/**
* @deprecated
* Use the return value of `useDelayGroup()` instead.
*/
var useDelayGroupContext = () => import_react.useContext(FloatingDelayGroupContext);
/**
* Provides context for a group of floating elements that should share a
* `delay`.
* @see https://floating-ui.com/docs/FloatingDelayGroup
*/
function FloatingDelayGroup(props) {
	const { children, delay, timeoutMs = 0 } = props;
	const [state, setState] = import_react.useReducer((prev, next) => ({
		...prev,
		...next
	}), {
		delay,
		timeoutMs,
		initialDelay: delay,
		currentId: null,
		isInstantPhase: false
	});
	const initialCurrentIdRef = import_react.useRef(null);
	const setCurrentId = import_react.useCallback((currentId) => {
		setState({ currentId });
	}, []);
	index$1(() => {
		if (state.currentId) {
			if (initialCurrentIdRef.current === null) initialCurrentIdRef.current = state.currentId;
			else if (!state.isInstantPhase) setState({ isInstantPhase: true });
		} else {
			if (state.isInstantPhase) setState({ isInstantPhase: false });
			initialCurrentIdRef.current = null;
		}
	}, [state.currentId, state.isInstantPhase]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatingDelayGroupContext.Provider, {
		value: import_react.useMemo(() => ({
			...state,
			setState,
			setCurrentId
		}), [state, setCurrentId]),
		children
	});
}
/**
* Enables grouping when called inside a component that's a child of a
* `FloatingDelayGroup`.
* @see https://floating-ui.com/docs/FloatingDelayGroup
*/
function useDelayGroup(context, options) {
	if (options === void 0) options = {};
	const { open, onOpenChange, floatingId } = context;
	const { id: optionId, enabled = true } = options;
	const id = optionId != null ? optionId : floatingId;
	const groupContext = useDelayGroupContext();
	const { currentId, setCurrentId, initialDelay, setState, timeoutMs } = groupContext;
	index$1(() => {
		if (!enabled) return;
		if (!currentId) return;
		setState({ delay: {
			open: 1,
			close: getDelay(initialDelay, "close")
		} });
		if (currentId !== id) onOpenChange(false);
	}, [
		enabled,
		id,
		onOpenChange,
		setState,
		currentId,
		initialDelay
	]);
	index$1(() => {
		function unset() {
			onOpenChange(false);
			setState({
				delay: initialDelay,
				currentId: null
			});
		}
		if (!enabled) return;
		if (!currentId) return;
		if (!open && currentId === id) {
			if (timeoutMs) {
				const timeout = window.setTimeout(unset, timeoutMs);
				return () => {
					clearTimeout(timeout);
				};
			}
			unset();
		}
	}, [
		enabled,
		open,
		setState,
		currentId,
		id,
		onOpenChange,
		initialDelay,
		timeoutMs
	]);
	index$1(() => {
		if (!enabled) return;
		if (setCurrentId === NOOP || !open) return;
		setCurrentId(id);
	}, [
		enabled,
		open,
		setCurrentId,
		id
	]);
	return groupContext;
}
var NextFloatingDelayGroupContext = /* @__PURE__ */ import_react.createContext({
	hasProvider: false,
	timeoutMs: 0,
	delayRef: { current: 0 },
	initialDelayRef: { current: 0 },
	timeoutIdRef: { current: -1 },
	currentIdRef: { current: null },
	currentContextRef: { current: null }
});
/**
* Experimental next version of `FloatingDelayGroup` to become the default
* in the future. This component is not yet stable.
* Provides context for a group of floating elements that should share a
* `delay`. Unlike `FloatingDelayGroup`, `useNextDelayGroup` with this
* component does not cause a re-render of unrelated consumers of the
* context when the delay changes.
* @see https://floating-ui.com/docs/FloatingDelayGroup
*/
function NextFloatingDelayGroup(props) {
	const { children, delay, timeoutMs = 0 } = props;
	const delayRef = import_react.useRef(delay);
	const initialDelayRef = import_react.useRef(delay);
	const currentIdRef = import_react.useRef(null);
	const currentContextRef = import_react.useRef(null);
	const timeoutIdRef = import_react.useRef(-1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NextFloatingDelayGroupContext.Provider, {
		value: import_react.useMemo(() => ({
			hasProvider: true,
			delayRef,
			initialDelayRef,
			currentIdRef,
			timeoutMs,
			currentContextRef,
			timeoutIdRef
		}), [timeoutMs]),
		children
	});
}
/**
* Enables grouping when called inside a component that's a child of a
* `NextFloatingDelayGroup`.
* @see https://floating-ui.com/docs/FloatingDelayGroup
*/
function useNextDelayGroup(context, options) {
	if (options === void 0) options = {};
	const { open, onOpenChange, floatingId } = context;
	const { enabled = true } = options;
	const { currentIdRef, delayRef, timeoutMs, initialDelayRef, currentContextRef, hasProvider, timeoutIdRef } = import_react.useContext(NextFloatingDelayGroupContext);
	const [isInstantPhase, setIsInstantPhase] = import_react.useState(false);
	index$1(() => {
		function unset() {
			var _currentContextRef$cu;
			setIsInstantPhase(false);
			(_currentContextRef$cu = currentContextRef.current) == null || _currentContextRef$cu.setIsInstantPhase(false);
			currentIdRef.current = null;
			currentContextRef.current = null;
			delayRef.current = initialDelayRef.current;
		}
		if (!enabled) return;
		if (!currentIdRef.current) return;
		if (!open && currentIdRef.current === floatingId) {
			setIsInstantPhase(false);
			if (timeoutMs) {
				timeoutIdRef.current = window.setTimeout(unset, timeoutMs);
				return () => {
					clearTimeout(timeoutIdRef.current);
				};
			}
			unset();
		}
	}, [
		enabled,
		open,
		floatingId,
		currentIdRef,
		delayRef,
		timeoutMs,
		initialDelayRef,
		currentContextRef,
		timeoutIdRef
	]);
	index$1(() => {
		if (!enabled) return;
		if (!open) return;
		const prevContext = currentContextRef.current;
		const prevId = currentIdRef.current;
		currentContextRef.current = {
			onOpenChange,
			setIsInstantPhase
		};
		currentIdRef.current = floatingId;
		delayRef.current = {
			open: 0,
			close: getDelay(initialDelayRef.current, "close")
		};
		if (prevId !== null && prevId !== floatingId) {
			clearTimeoutIfSet(timeoutIdRef);
			setIsInstantPhase(true);
			prevContext?.setIsInstantPhase(true);
			prevContext?.onOpenChange(false);
		} else {
			setIsInstantPhase(false);
			prevContext?.setIsInstantPhase(false);
		}
	}, [
		enabled,
		open,
		floatingId,
		onOpenChange,
		currentIdRef,
		delayRef,
		timeoutMs,
		initialDelayRef,
		currentContextRef,
		timeoutIdRef
	]);
	index$1(() => {
		return () => {
			currentContextRef.current = null;
		};
	}, [currentContextRef]);
	return import_react.useMemo(() => ({
		hasProvider,
		delayRef,
		isInstantPhase
	}), [
		hasProvider,
		delayRef,
		isInstantPhase
	]);
}
var rafId = 0;
function enqueueFocus(el, options) {
	if (options === void 0) options = {};
	const { preventScroll = false, cancelPrevious = true, sync = false } = options;
	cancelPrevious && cancelAnimationFrame(rafId);
	const exec = () => el == null ? void 0 : el.focus({ preventScroll });
	if (sync) exec();
	else rafId = requestAnimationFrame(exec);
}
function contains(parent, child) {
	if (!parent || !child) return false;
	const rootNode = child.getRootNode == null ? void 0 : child.getRootNode();
	if (parent.contains(child)) return true;
	if (rootNode && isShadowRoot(rootNode)) {
		let next = child;
		while (next) {
			if (parent === next) return true;
			next = next.parentNode || next.host;
		}
	}
	return false;
}
function getTarget(event) {
	if ("composedPath" in event) return event.composedPath()[0];
	return event.target;
}
function getDocument(node) {
	return (node == null ? void 0 : node.ownerDocument) || document;
}
var counters = {
	inert: /* @__PURE__ */ new WeakMap(),
	"aria-hidden": /* @__PURE__ */ new WeakMap(),
	none: /* @__PURE__ */ new WeakMap()
};
function getCounterMap(control) {
	if (control === "inert") return counters.inert;
	if (control === "aria-hidden") return counters["aria-hidden"];
	return counters.none;
}
var uncontrolledElementsSet = /* @__PURE__ */ new WeakSet();
var markerMap = {};
var lockCount$1 = 0;
var supportsInert = () => typeof HTMLElement !== "undefined" && "inert" in HTMLElement.prototype;
var unwrapHost = (node) => node && (node.host || unwrapHost(node.parentNode));
var correctElements = (parent, targets) => targets.map((target) => {
	if (parent.contains(target)) return target;
	const correctedTarget = unwrapHost(target);
	if (parent.contains(correctedTarget)) return correctedTarget;
	return null;
}).filter((x) => x != null);
function applyAttributeToOthers(uncorrectedAvoidElements, body, ariaHidden, inert) {
	const markerName = "data-floating-ui-inert";
	const controlAttribute = inert ? "inert" : ariaHidden ? "aria-hidden" : null;
	const avoidElements = correctElements(body, uncorrectedAvoidElements);
	const elementsToKeep = /* @__PURE__ */ new Set();
	const elementsToStop = new Set(avoidElements);
	const hiddenElements = [];
	if (!markerMap[markerName]) markerMap[markerName] = /* @__PURE__ */ new WeakMap();
	const markerCounter = markerMap[markerName];
	avoidElements.forEach(keep);
	deep(body);
	elementsToKeep.clear();
	function keep(el) {
		if (!el || elementsToKeep.has(el)) return;
		elementsToKeep.add(el);
		el.parentNode && keep(el.parentNode);
	}
	function deep(parent) {
		if (!parent || elementsToStop.has(parent)) return;
		[].forEach.call(parent.children, (node) => {
			if (getNodeName(node) === "script") return;
			if (elementsToKeep.has(node)) deep(node);
			else {
				const attr = controlAttribute ? node.getAttribute(controlAttribute) : null;
				const alreadyHidden = attr !== null && attr !== "false";
				const counterMap = getCounterMap(controlAttribute);
				const counterValue = (counterMap.get(node) || 0) + 1;
				const markerValue = (markerCounter.get(node) || 0) + 1;
				counterMap.set(node, counterValue);
				markerCounter.set(node, markerValue);
				hiddenElements.push(node);
				if (counterValue === 1 && alreadyHidden) uncontrolledElementsSet.add(node);
				if (markerValue === 1) node.setAttribute(markerName, "");
				if (!alreadyHidden && controlAttribute) node.setAttribute(controlAttribute, controlAttribute === "inert" ? "" : "true");
			}
		});
	}
	lockCount$1++;
	return () => {
		hiddenElements.forEach((element) => {
			const counterMap = getCounterMap(controlAttribute);
			const counterValue = (counterMap.get(element) || 0) - 1;
			const markerValue = (markerCounter.get(element) || 0) - 1;
			counterMap.set(element, counterValue);
			markerCounter.set(element, markerValue);
			if (!counterValue) {
				if (!uncontrolledElementsSet.has(element) && controlAttribute) element.removeAttribute(controlAttribute);
				uncontrolledElementsSet.delete(element);
			}
			if (!markerValue) element.removeAttribute(markerName);
		});
		lockCount$1--;
		if (!lockCount$1) {
			counters.inert = /* @__PURE__ */ new WeakMap();
			counters["aria-hidden"] = /* @__PURE__ */ new WeakMap();
			counters.none = /* @__PURE__ */ new WeakMap();
			uncontrolledElementsSet = /* @__PURE__ */ new WeakSet();
			markerMap = {};
		}
	};
}
function markOthers(avoidElements, ariaHidden, inert) {
	if (ariaHidden === void 0) ariaHidden = false;
	if (inert === void 0) inert = false;
	const body = getDocument(avoidElements[0]).body;
	return applyAttributeToOthers(avoidElements.concat(Array.from(body.querySelectorAll("[aria-live],[role=\"status\"],output"))), body, ariaHidden, inert);
}
var HIDDEN_STYLES = {
	border: 0,
	clip: "rect(0 0 0 0)",
	height: "1px",
	margin: "-1px",
	overflow: "hidden",
	padding: 0,
	position: "fixed",
	whiteSpace: "nowrap",
	width: "1px",
	top: 0,
	left: 0
};
var FocusGuard = /* @__PURE__ */ import_react.forwardRef(function FocusGuard(props, ref) {
	const [role, setRole] = import_react.useState();
	index$1(() => {
		if (isSafari()) setRole("button");
	}, []);
	const restProps = {
		ref,
		tabIndex: 0,
		role,
		"aria-hidden": role ? void 0 : true,
		[createAttribute("focus-guard")]: "",
		style: HIDDEN_STYLES
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		...props,
		...restProps
	});
});
var HIDDEN_OWNER_STYLES = {
	clipPath: "inset(50%)",
	position: "fixed",
	top: 0,
	left: 0
};
var PortalContext = /* @__PURE__ */ import_react.createContext(null);
var attr = /* @__PURE__ */ createAttribute("portal");
/**
* @see https://floating-ui.com/docs/FloatingPortal#usefloatingportalnode
*/
function useFloatingPortalNode(props) {
	if (props === void 0) props = {};
	const { id, root } = props;
	const uniqueId = useId();
	const portalContext = usePortalContext();
	const [portalNode, setPortalNode] = import_react.useState(null);
	const portalNodeRef = import_react.useRef(null);
	index$1(() => {
		return () => {
			portalNode?.remove();
			queueMicrotask(() => {
				portalNodeRef.current = null;
			});
		};
	}, [portalNode]);
	index$1(() => {
		if (!uniqueId) return;
		if (portalNodeRef.current) return;
		const existingIdRoot = id ? document.getElementById(id) : null;
		if (!existingIdRoot) return;
		const subRoot = document.createElement("div");
		subRoot.id = uniqueId;
		subRoot.setAttribute(attr, "");
		existingIdRoot.appendChild(subRoot);
		portalNodeRef.current = subRoot;
		setPortalNode(subRoot);
	}, [id, uniqueId]);
	index$1(() => {
		if (root === null) return;
		if (!uniqueId) return;
		if (portalNodeRef.current) return;
		let container = root || (portalContext == null ? void 0 : portalContext.portalNode);
		if (container && !isNode(container)) container = container.current;
		container = container || document.body;
		let idWrapper = null;
		if (id) {
			idWrapper = document.createElement("div");
			idWrapper.id = id;
			container.appendChild(idWrapper);
		}
		const subRoot = document.createElement("div");
		subRoot.id = uniqueId;
		subRoot.setAttribute(attr, "");
		container = idWrapper || container;
		container.appendChild(subRoot);
		portalNodeRef.current = subRoot;
		setPortalNode(subRoot);
	}, [
		id,
		root,
		uniqueId,
		portalContext
	]);
	return portalNode;
}
/**
* Portals the floating element into a given container element — by default,
* outside of the app root and into the body.
* This is necessary to ensure the floating element can appear outside any
* potential parent containers that cause clipping (such as `overflow: hidden`),
* while retaining its location in the React tree.
* @see https://floating-ui.com/docs/FloatingPortal
*/
function FloatingPortal(props) {
	const { children, id, root, preserveTabOrder = true } = props;
	const portalNode = useFloatingPortalNode({
		id,
		root
	});
	const [focusManagerState, setFocusManagerState] = import_react.useState(null);
	const beforeOutsideRef = import_react.useRef(null);
	const afterOutsideRef = import_react.useRef(null);
	const beforeInsideRef = import_react.useRef(null);
	const afterInsideRef = import_react.useRef(null);
	const modal = focusManagerState == null ? void 0 : focusManagerState.modal;
	const open = focusManagerState == null ? void 0 : focusManagerState.open;
	const shouldRenderGuards = !!focusManagerState && !focusManagerState.modal && focusManagerState.open && preserveTabOrder && !!(root || portalNode);
	import_react.useEffect(() => {
		if (!portalNode || !preserveTabOrder || modal) return;
		function onFocus(event) {
			if (portalNode && isOutsideEvent(event)) (event.type === "focusin" ? enableFocusInside : disableFocusInside)(portalNode);
		}
		portalNode.addEventListener("focusin", onFocus, true);
		portalNode.addEventListener("focusout", onFocus, true);
		return () => {
			portalNode.removeEventListener("focusin", onFocus, true);
			portalNode.removeEventListener("focusout", onFocus, true);
		};
	}, [
		portalNode,
		preserveTabOrder,
		modal
	]);
	import_react.useEffect(() => {
		if (!portalNode) return;
		if (open) return;
		enableFocusInside(portalNode);
	}, [open, portalNode]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PortalContext.Provider, {
		value: import_react.useMemo(() => ({
			preserveTabOrder,
			beforeOutsideRef,
			afterOutsideRef,
			beforeInsideRef,
			afterInsideRef,
			portalNode,
			setFocusManagerState
		}), [preserveTabOrder, portalNode]),
		children: [
			shouldRenderGuards && portalNode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FocusGuard, {
				"data-type": "outside",
				ref: beforeOutsideRef,
				onFocus: (event) => {
					if (isOutsideEvent(event, portalNode)) {
						var _beforeInsideRef$curr;
						(_beforeInsideRef$curr = beforeInsideRef.current) == null || _beforeInsideRef$curr.focus();
					} else getPreviousTabbable(focusManagerState ? focusManagerState.domReference : null)?.focus();
				}
			}),
			shouldRenderGuards && portalNode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"aria-owns": portalNode.id,
				style: HIDDEN_OWNER_STYLES
			}),
			portalNode && /* @__PURE__ */ import_react_dom.createPortal(children, portalNode),
			shouldRenderGuards && portalNode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FocusGuard, {
				"data-type": "outside",
				ref: afterOutsideRef,
				onFocus: (event) => {
					if (isOutsideEvent(event, portalNode)) {
						var _afterInsideRef$curre;
						(_afterInsideRef$curre = afterInsideRef.current) == null || _afterInsideRef$curre.focus();
					} else {
						getNextTabbable(focusManagerState ? focusManagerState.domReference : null)?.focus();
						focusManagerState != null && focusManagerState.closeOnFocusOut && focusManagerState?.onOpenChange(false, event.nativeEvent, "focus-out");
					}
				}
			})
		]
	});
}
var usePortalContext = () => import_react.useContext(PortalContext);
function useLiteMergeRefs(refs) {
	return import_react.useMemo(() => {
		return (value) => {
			refs.forEach((ref) => {
				if (ref) ref.current = value;
			});
		};
	}, refs);
}
var LIST_LIMIT = 20;
var previouslyFocusedElements = [];
function clearDisconnectedPreviouslyFocusedElements() {
	previouslyFocusedElements = previouslyFocusedElements.filter((elementRef) => {
		var _elementRef$deref;
		return (_elementRef$deref = elementRef.deref()) == null ? void 0 : _elementRef$deref.isConnected;
	});
}
function addPreviouslyFocusedElement(element) {
	clearDisconnectedPreviouslyFocusedElements();
	if (element && getNodeName(element) !== "body") {
		previouslyFocusedElements.push(new WeakRef(element));
		if (previouslyFocusedElements.length > LIST_LIMIT) previouslyFocusedElements = previouslyFocusedElements.slice(-20);
	}
}
function getPreviouslyFocusedElement() {
	clearDisconnectedPreviouslyFocusedElements();
	const elementRef = previouslyFocusedElements[previouslyFocusedElements.length - 1];
	return elementRef == null ? void 0 : elementRef.deref();
}
function getFirstTabbableElement(container) {
	const tabbableOptions = getTabbableOptions();
	if (isTabbable(container, tabbableOptions)) return container;
	return tabbable(container, tabbableOptions)[0] || container;
}
function handleTabIndex(floatingFocusElement, orderRef) {
	var _floatingFocusElement;
	if (!orderRef.current.includes("floating") && !((_floatingFocusElement = floatingFocusElement.getAttribute("role")) != null && _floatingFocusElement.includes("dialog"))) return;
	const options = getTabbableOptions();
	const tabbableContent = focusable(floatingFocusElement, options).filter((element) => {
		const dataTabIndex = element.getAttribute("data-tabindex") || "";
		return isTabbable(element, options) || element.hasAttribute("data-tabindex") && !dataTabIndex.startsWith("-");
	});
	const tabIndex = floatingFocusElement.getAttribute("tabindex");
	if (orderRef.current.includes("floating") || tabbableContent.length === 0) {
		if (tabIndex !== "0") floatingFocusElement.setAttribute("tabindex", "0");
	} else if (tabIndex !== "-1" || floatingFocusElement.hasAttribute("data-tabindex") && floatingFocusElement.getAttribute("data-tabindex") !== "-1") {
		floatingFocusElement.setAttribute("tabindex", "-1");
		floatingFocusElement.setAttribute("data-tabindex", "-1");
	}
}
var VisuallyHiddenDismiss = /* @__PURE__ */ import_react.forwardRef(function VisuallyHiddenDismiss(props, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		...props,
		type: "button",
		ref,
		tabIndex: -1,
		style: HIDDEN_STYLES
	});
});
/**
* Provides focus management for the floating element.
* @see https://floating-ui.com/docs/FloatingFocusManager
*/
function FloatingFocusManager(props) {
	const { context, children, disabled = false, order = ["content"], guards: _guards = true, initialFocus = 0, returnFocus = true, restoreFocus = false, modal = true, visuallyHiddenDismiss = false, closeOnFocusOut = true, outsideElementsInert = false, getInsideElements: _getInsideElements = () => [] } = props;
	const { open, onOpenChange, events, dataRef, elements: { domReference, floating } } = context;
	const getNodeId = useEffectEvent(() => {
		var _dataRef$current$floa;
		return (_dataRef$current$floa = dataRef.current.floatingContext) == null ? void 0 : _dataRef$current$floa.nodeId;
	});
	const getInsideElements = useEffectEvent(_getInsideElements);
	const ignoreInitialFocus = typeof initialFocus === "number" && initialFocus < 0;
	const isUntrappedTypeableCombobox = isTypeableCombobox(domReference) && ignoreInitialFocus;
	const inertSupported = supportsInert();
	const guards = inertSupported ? _guards : true;
	const useInert = !guards || inertSupported && outsideElementsInert;
	const orderRef = useLatestRef$1(order);
	const initialFocusRef = useLatestRef$1(initialFocus);
	const returnFocusRef = useLatestRef$1(returnFocus);
	const tree = useFloatingTree();
	const portalContext = usePortalContext();
	const startDismissButtonRef = import_react.useRef(null);
	const endDismissButtonRef = import_react.useRef(null);
	const preventReturnFocusRef = import_react.useRef(false);
	const isPointerDownRef = import_react.useRef(false);
	const tabbableIndexRef = import_react.useRef(-1);
	const blurTimeoutRef = import_react.useRef(-1);
	const isInsidePortal = portalContext != null;
	const floatingFocusElement = getFloatingFocusElement(floating);
	const getTabbableContent = useEffectEvent(function(container) {
		if (container === void 0) container = floatingFocusElement;
		return container ? tabbable(container, getTabbableOptions()) : [];
	});
	const getTabbableElements = useEffectEvent((container) => {
		const content = getTabbableContent(container);
		return orderRef.current.map((type) => {
			if (domReference && type === "reference") return domReference;
			if (floatingFocusElement && type === "floating") return floatingFocusElement;
			return content;
		}).filter(Boolean).flat();
	});
	import_react.useEffect(() => {
		if (disabled) return;
		if (!modal) return;
		function onKeyDown(event) {
			if (event.key === "Tab") {
				if (contains$1(floatingFocusElement, activeElement(getDocument$1(floatingFocusElement))) && getTabbableContent().length === 0 && !isUntrappedTypeableCombobox) stopEvent(event);
				const els = getTabbableElements();
				const target = getTarget$1(event);
				if (orderRef.current[0] === "reference" && target === domReference) {
					stopEvent(event);
					if (event.shiftKey) enqueueFocus(els[els.length - 1]);
					else enqueueFocus(els[1]);
				}
				if (orderRef.current[1] === "floating" && target === floatingFocusElement && event.shiftKey) {
					stopEvent(event);
					enqueueFocus(els[0]);
				}
			}
		}
		const doc = getDocument$1(floatingFocusElement);
		doc.addEventListener("keydown", onKeyDown);
		return () => {
			doc.removeEventListener("keydown", onKeyDown);
		};
	}, [
		disabled,
		domReference,
		floatingFocusElement,
		modal,
		orderRef,
		isUntrappedTypeableCombobox,
		getTabbableContent,
		getTabbableElements
	]);
	import_react.useEffect(() => {
		if (disabled) return;
		if (!floating) return;
		function handleFocusIn(event) {
			const target = getTarget$1(event);
			const tabbableIndex = getTabbableContent().indexOf(target);
			if (tabbableIndex !== -1) tabbableIndexRef.current = tabbableIndex;
		}
		floating.addEventListener("focusin", handleFocusIn);
		return () => {
			floating.removeEventListener("focusin", handleFocusIn);
		};
	}, [
		disabled,
		floating,
		getTabbableContent
	]);
	import_react.useEffect(() => {
		if (disabled) return;
		if (!closeOnFocusOut) return;
		function handlePointerDown() {
			isPointerDownRef.current = true;
			setTimeout(() => {
				isPointerDownRef.current = false;
			});
		}
		function handleFocusOutside(event) {
			const relatedTarget = event.relatedTarget;
			const currentTarget = event.currentTarget;
			const target = getTarget$1(event);
			queueMicrotask(() => {
				const nodeId = getNodeId();
				const movedToUnrelatedNode = !(contains$1(domReference, relatedTarget) || contains$1(floating, relatedTarget) || contains$1(relatedTarget, floating) || contains$1(portalContext == null ? void 0 : portalContext.portalNode, relatedTarget) || relatedTarget != null && relatedTarget.hasAttribute(createAttribute("focus-guard")) || tree && (getNodeChildren$1(tree.nodesRef.current, nodeId).find((node) => {
					var _node$context, _node$context2;
					return contains$1((_node$context = node.context) == null ? void 0 : _node$context.elements.floating, relatedTarget) || contains$1((_node$context2 = node.context) == null ? void 0 : _node$context2.elements.domReference, relatedTarget);
				}) || getNodeAncestors(tree.nodesRef.current, nodeId).find((node) => {
					var _node$context3, _node$context4, _node$context5;
					return [(_node$context3 = node.context) == null ? void 0 : _node$context3.elements.floating, getFloatingFocusElement((_node$context4 = node.context) == null ? void 0 : _node$context4.elements.floating)].includes(relatedTarget) || ((_node$context5 = node.context) == null ? void 0 : _node$context5.elements.domReference) === relatedTarget;
				})));
				if (currentTarget === domReference && floatingFocusElement) handleTabIndex(floatingFocusElement, orderRef);
				if (restoreFocus && currentTarget !== domReference && !(target != null && target.isConnected) && activeElement(getDocument$1(floatingFocusElement)) === getDocument$1(floatingFocusElement).body) {
					if (isHTMLElement(floatingFocusElement)) floatingFocusElement.focus();
					const prevTabbableIndex = tabbableIndexRef.current;
					const tabbableContent = getTabbableContent();
					const nodeToFocus = tabbableContent[prevTabbableIndex] || tabbableContent[tabbableContent.length - 1] || floatingFocusElement;
					if (isHTMLElement(nodeToFocus)) nodeToFocus.focus();
				}
				if (dataRef.current.insideReactTree) {
					dataRef.current.insideReactTree = false;
					return;
				}
				if ((isUntrappedTypeableCombobox ? true : !modal) && relatedTarget && movedToUnrelatedNode && !isPointerDownRef.current && relatedTarget !== getPreviouslyFocusedElement()) {
					preventReturnFocusRef.current = true;
					onOpenChange(false, event, "focus-out");
				}
			});
		}
		const shouldHandleBlurCapture = Boolean(!tree && portalContext);
		function markInsideReactTree() {
			clearTimeoutIfSet(blurTimeoutRef);
			dataRef.current.insideReactTree = true;
			blurTimeoutRef.current = window.setTimeout(() => {
				dataRef.current.insideReactTree = false;
			});
		}
		if (floating && isHTMLElement(domReference)) {
			domReference.addEventListener("focusout", handleFocusOutside);
			domReference.addEventListener("pointerdown", handlePointerDown);
			floating.addEventListener("focusout", handleFocusOutside);
			if (shouldHandleBlurCapture) floating.addEventListener("focusout", markInsideReactTree, true);
			return () => {
				domReference.removeEventListener("focusout", handleFocusOutside);
				domReference.removeEventListener("pointerdown", handlePointerDown);
				floating.removeEventListener("focusout", handleFocusOutside);
				if (shouldHandleBlurCapture) floating.removeEventListener("focusout", markInsideReactTree, true);
			};
		}
	}, [
		disabled,
		domReference,
		floating,
		floatingFocusElement,
		modal,
		tree,
		portalContext,
		onOpenChange,
		closeOnFocusOut,
		restoreFocus,
		getTabbableContent,
		isUntrappedTypeableCombobox,
		getNodeId,
		orderRef,
		dataRef
	]);
	const beforeGuardRef = import_react.useRef(null);
	const afterGuardRef = import_react.useRef(null);
	const mergedBeforeGuardRef = useLiteMergeRefs([beforeGuardRef, portalContext == null ? void 0 : portalContext.beforeInsideRef]);
	const mergedAfterGuardRef = useLiteMergeRefs([afterGuardRef, portalContext == null ? void 0 : portalContext.afterInsideRef]);
	import_react.useEffect(() => {
		var _portalContext$portal, _ancestors$find;
		if (disabled) return;
		if (!floating) return;
		const portalNodes = Array.from((portalContext == null || (_portalContext$portal = portalContext.portalNode) == null ? void 0 : _portalContext$portal.querySelectorAll("[" + createAttribute("portal") + "]")) || []);
		const insideElements = [
			floating,
			(_ancestors$find = (tree ? getNodeAncestors(tree.nodesRef.current, getNodeId()) : []).find((node) => {
				var _node$context6;
				return isTypeableCombobox(((_node$context6 = node.context) == null ? void 0 : _node$context6.elements.domReference) || null);
			})) == null || (_ancestors$find = _ancestors$find.context) == null ? void 0 : _ancestors$find.elements.domReference,
			...portalNodes,
			...getInsideElements(),
			startDismissButtonRef.current,
			endDismissButtonRef.current,
			beforeGuardRef.current,
			afterGuardRef.current,
			portalContext == null ? void 0 : portalContext.beforeOutsideRef.current,
			portalContext == null ? void 0 : portalContext.afterOutsideRef.current,
			orderRef.current.includes("reference") || isUntrappedTypeableCombobox ? domReference : null
		].filter((x) => x != null);
		const cleanup = modal || isUntrappedTypeableCombobox ? markOthers(insideElements, !useInert, useInert) : markOthers(insideElements);
		return () => {
			cleanup();
		};
	}, [
		disabled,
		domReference,
		floating,
		modal,
		orderRef,
		portalContext,
		isUntrappedTypeableCombobox,
		guards,
		useInert,
		tree,
		getNodeId,
		getInsideElements
	]);
	index$1(() => {
		if (disabled || !isHTMLElement(floatingFocusElement)) return;
		const previouslyFocusedElement = activeElement(getDocument$1(floatingFocusElement));
		queueMicrotask(() => {
			const focusableElements = getTabbableElements(floatingFocusElement);
			const initialFocusValue = initialFocusRef.current;
			const elToFocus = (typeof initialFocusValue === "number" ? focusableElements[initialFocusValue] : initialFocusValue.current) || floatingFocusElement;
			const focusAlreadyInsideFloatingEl = contains$1(floatingFocusElement, previouslyFocusedElement);
			if (!ignoreInitialFocus && !focusAlreadyInsideFloatingEl && open) enqueueFocus(elToFocus, { preventScroll: elToFocus === floatingFocusElement });
		});
	}, [
		disabled,
		open,
		floatingFocusElement,
		ignoreInitialFocus,
		getTabbableElements,
		initialFocusRef
	]);
	index$1(() => {
		if (disabled || !floatingFocusElement) return;
		const doc = getDocument$1(floatingFocusElement);
		addPreviouslyFocusedElement(activeElement(doc));
		function onOpenChange(_ref) {
			let { reason, event, nested } = _ref;
			if (["hover", "safe-polygon"].includes(reason) && event.type === "mouseleave") preventReturnFocusRef.current = true;
			if (reason !== "outside-press") return;
			if (nested) preventReturnFocusRef.current = false;
			else if (isVirtualClick(event) || isVirtualPointerEvent(event)) preventReturnFocusRef.current = false;
			else {
				let isPreventScrollSupported = false;
				document.createElement("div").focus({ get preventScroll() {
					isPreventScrollSupported = true;
					return false;
				} });
				if (isPreventScrollSupported) preventReturnFocusRef.current = false;
				else preventReturnFocusRef.current = true;
			}
		}
		events.on("openchange", onOpenChange);
		const fallbackEl = doc.createElement("span");
		fallbackEl.setAttribute("tabindex", "-1");
		fallbackEl.setAttribute("aria-hidden", "true");
		Object.assign(fallbackEl.style, HIDDEN_STYLES);
		if (isInsidePortal && domReference) domReference.insertAdjacentElement("afterend", fallbackEl);
		function getReturnElement() {
			if (typeof returnFocusRef.current === "boolean") {
				const el = domReference || getPreviouslyFocusedElement();
				return el && el.isConnected ? el : fallbackEl;
			}
			return returnFocusRef.current.current || fallbackEl;
		}
		return () => {
			events.off("openchange", onOpenChange);
			const activeEl = activeElement(doc);
			const isFocusInsideFloatingTree = contains$1(floating, activeEl) || tree && getNodeChildren$1(tree.nodesRef.current, getNodeId(), false).some((node) => {
				var _node$context7;
				return contains$1((_node$context7 = node.context) == null ? void 0 : _node$context7.elements.floating, activeEl);
			});
			const returnElement = getReturnElement();
			queueMicrotask(() => {
				const tabbableReturnElement = getFirstTabbableElement(returnElement);
				if (returnFocusRef.current && !preventReturnFocusRef.current && isHTMLElement(tabbableReturnElement) && (tabbableReturnElement !== activeEl && activeEl !== doc.body ? isFocusInsideFloatingTree : true)) tabbableReturnElement.focus({ preventScroll: true });
				fallbackEl.remove();
			});
		};
	}, [
		disabled,
		floating,
		floatingFocusElement,
		returnFocusRef,
		dataRef,
		events,
		tree,
		isInsidePortal,
		domReference,
		getNodeId
	]);
	import_react.useEffect(() => {
		queueMicrotask(() => {
			preventReturnFocusRef.current = false;
		});
		return () => {
			queueMicrotask(clearDisconnectedPreviouslyFocusedElements);
		};
	}, [disabled]);
	index$1(() => {
		if (disabled) return;
		if (!portalContext) return;
		portalContext.setFocusManagerState({
			modal,
			closeOnFocusOut,
			open,
			onOpenChange,
			domReference
		});
		return () => {
			portalContext.setFocusManagerState(null);
		};
	}, [
		disabled,
		portalContext,
		modal,
		open,
		onOpenChange,
		closeOnFocusOut,
		domReference
	]);
	index$1(() => {
		if (disabled) return;
		if (!floatingFocusElement) return;
		handleTabIndex(floatingFocusElement, orderRef);
	}, [
		disabled,
		floatingFocusElement,
		orderRef
	]);
	function renderDismissButton(location) {
		if (disabled || !visuallyHiddenDismiss || !modal) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisuallyHiddenDismiss, {
			ref: location === "start" ? startDismissButtonRef : endDismissButtonRef,
			onClick: (event) => onOpenChange(false, event.nativeEvent),
			children: typeof visuallyHiddenDismiss === "string" ? visuallyHiddenDismiss : "Dismiss"
		});
	}
	const shouldRenderGuards = !disabled && guards && (modal ? !isUntrappedTypeableCombobox : true) && (isInsidePortal || modal);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		shouldRenderGuards && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FocusGuard, {
			"data-type": "inside",
			ref: mergedBeforeGuardRef,
			onFocus: (event) => {
				if (modal) {
					const els = getTabbableElements();
					enqueueFocus(order[0] === "reference" ? els[0] : els[els.length - 1]);
				} else if (portalContext != null && portalContext.preserveTabOrder && portalContext.portalNode) {
					preventReturnFocusRef.current = false;
					if (isOutsideEvent(event, portalContext.portalNode)) getNextTabbable(domReference)?.focus();
					else {
						var _portalContext$before;
						(_portalContext$before = portalContext.beforeOutsideRef.current) == null || _portalContext$before.focus();
					}
				}
			}
		}),
		!isUntrappedTypeableCombobox && renderDismissButton("start"),
		children,
		renderDismissButton("end"),
		shouldRenderGuards && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FocusGuard, {
			"data-type": "inside",
			ref: mergedAfterGuardRef,
			onFocus: (event) => {
				if (modal) enqueueFocus(getTabbableElements()[0]);
				else if (portalContext != null && portalContext.preserveTabOrder && portalContext.portalNode) {
					if (closeOnFocusOut) preventReturnFocusRef.current = true;
					if (isOutsideEvent(event, portalContext.portalNode)) getPreviousTabbable(domReference)?.focus();
					else {
						var _portalContext$afterO;
						(_portalContext$afterO = portalContext.afterOutsideRef.current) == null || _portalContext$afterO.focus();
					}
				}
			}
		})
	] });
}
var lockCount = 0;
var scrollbarProperty = "--floating-ui-scrollbar-width";
function enableScrollLock() {
	const platform = getPlatform();
	const isIOS = /iP(hone|ad|od)|iOS/.test(platform) || platform === "MacIntel" && navigator.maxTouchPoints > 1;
	const bodyStyle = document.body.style;
	const paddingProp = Math.round(document.documentElement.getBoundingClientRect().left) + document.documentElement.scrollLeft ? "paddingLeft" : "paddingRight";
	const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
	const scrollX = bodyStyle.left ? parseFloat(bodyStyle.left) : window.scrollX;
	const scrollY = bodyStyle.top ? parseFloat(bodyStyle.top) : window.scrollY;
	bodyStyle.overflow = "hidden";
	bodyStyle.setProperty(scrollbarProperty, scrollbarWidth + "px");
	if (scrollbarWidth) bodyStyle[paddingProp] = scrollbarWidth + "px";
	if (isIOS) {
		var _window$visualViewpor, _window$visualViewpor2;
		const offsetLeft = ((_window$visualViewpor = window.visualViewport) == null ? void 0 : _window$visualViewpor.offsetLeft) || 0;
		const offsetTop = ((_window$visualViewpor2 = window.visualViewport) == null ? void 0 : _window$visualViewpor2.offsetTop) || 0;
		Object.assign(bodyStyle, {
			position: "fixed",
			top: -(scrollY - Math.floor(offsetTop)) + "px",
			left: -(scrollX - Math.floor(offsetLeft)) + "px",
			right: "0"
		});
	}
	return () => {
		Object.assign(bodyStyle, {
			overflow: "",
			[paddingProp]: ""
		});
		bodyStyle.removeProperty(scrollbarProperty);
		if (isIOS) {
			Object.assign(bodyStyle, {
				position: "",
				top: "",
				left: "",
				right: ""
			});
			window.scrollTo(scrollX, scrollY);
		}
	};
}
var cleanup = () => {};
/**
* Provides base styling for a fixed overlay element to dim content or block
* pointer events behind a floating element.
* It's a regular `<div>`, so it can be styled via any CSS solution you prefer.
* @see https://floating-ui.com/docs/FloatingOverlay
*/
var FloatingOverlay = /* @__PURE__ */ import_react.forwardRef(function FloatingOverlay(props, ref) {
	const { lockScroll = false, ...rest } = props;
	index$1(() => {
		if (!lockScroll) return;
		lockCount++;
		if (lockCount === 1) cleanup = enableScrollLock();
		return () => {
			lockCount--;
			if (lockCount === 0) cleanup();
		};
	}, [lockScroll]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		...rest,
		style: {
			position: "fixed",
			overflow: "auto",
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
			...rest.style
		}
	});
});
function isButtonTarget(event) {
	return isHTMLElement(event.target) && event.target.tagName === "BUTTON";
}
function isAnchorTarget(event) {
	return isHTMLElement(event.target) && event.target.tagName === "A";
}
function isSpaceIgnored(element) {
	return isTypeableElement(element);
}
/**
* Opens or closes the floating element when clicking the reference element.
* @see https://floating-ui.com/docs/useClick
*/
function useClick(context, props) {
	if (props === void 0) props = {};
	const { open, onOpenChange, dataRef, elements: { domReference } } = context;
	const { enabled = true, event: eventOption = "click", toggle = true, ignoreMouse = false, keyboardHandlers = true, stickIfOpen = true } = props;
	const pointerTypeRef = import_react.useRef();
	const didKeyDownRef = import_react.useRef(false);
	const reference = import_react.useMemo(() => ({
		onPointerDown(event) {
			pointerTypeRef.current = event.pointerType;
		},
		onMouseDown(event) {
			const pointerType = pointerTypeRef.current;
			if (event.button !== 0) return;
			if (eventOption === "click") return;
			if (isMouseLikePointerType(pointerType, true) && ignoreMouse) return;
			if (open && toggle && (dataRef.current.openEvent && stickIfOpen ? dataRef.current.openEvent.type === "mousedown" : true)) onOpenChange(false, event.nativeEvent, "click");
			else {
				event.preventDefault();
				onOpenChange(true, event.nativeEvent, "click");
			}
		},
		onClick(event) {
			const pointerType = pointerTypeRef.current;
			if (eventOption === "mousedown" && pointerTypeRef.current) {
				pointerTypeRef.current = void 0;
				return;
			}
			if (isMouseLikePointerType(pointerType, true) && ignoreMouse) return;
			if (open && toggle && (dataRef.current.openEvent && stickIfOpen ? dataRef.current.openEvent.type === "click" : true)) onOpenChange(false, event.nativeEvent, "click");
			else onOpenChange(true, event.nativeEvent, "click");
		},
		onKeyDown(event) {
			pointerTypeRef.current = void 0;
			if (event.defaultPrevented || !keyboardHandlers || isButtonTarget(event)) return;
			if (event.key === " " && !isSpaceIgnored(domReference)) {
				event.preventDefault();
				didKeyDownRef.current = true;
			}
			if (isAnchorTarget(event)) return;
			if (event.key === "Enter") if (open && toggle) onOpenChange(false, event.nativeEvent, "click");
			else onOpenChange(true, event.nativeEvent, "click");
		},
		onKeyUp(event) {
			if (event.defaultPrevented || !keyboardHandlers || isButtonTarget(event) || isSpaceIgnored(domReference)) return;
			if (event.key === " " && didKeyDownRef.current) {
				didKeyDownRef.current = false;
				if (open && toggle) onOpenChange(false, event.nativeEvent, "click");
				else onOpenChange(true, event.nativeEvent, "click");
			}
		}
	}), [
		dataRef,
		domReference,
		eventOption,
		ignoreMouse,
		keyboardHandlers,
		onOpenChange,
		open,
		stickIfOpen,
		toggle
	]);
	return import_react.useMemo(() => enabled ? { reference } : {}, [enabled, reference]);
}
function createVirtualElement(domElement, data) {
	let offsetX = null;
	let offsetY = null;
	let isAutoUpdateEvent = false;
	return {
		contextElement: domElement || void 0,
		getBoundingClientRect() {
			var _data$dataRef$current;
			const domRect = (domElement == null ? void 0 : domElement.getBoundingClientRect()) || {
				width: 0,
				height: 0,
				x: 0,
				y: 0
			};
			const isXAxis = data.axis === "x" || data.axis === "both";
			const isYAxis = data.axis === "y" || data.axis === "both";
			const canTrackCursorOnAutoUpdate = ["mouseenter", "mousemove"].includes(((_data$dataRef$current = data.dataRef.current.openEvent) == null ? void 0 : _data$dataRef$current.type) || "") && data.pointerType !== "touch";
			let width = domRect.width;
			let height = domRect.height;
			let x = domRect.x;
			let y = domRect.y;
			if (offsetX == null && data.x && isXAxis) offsetX = domRect.x - data.x;
			if (offsetY == null && data.y && isYAxis) offsetY = domRect.y - data.y;
			x -= offsetX || 0;
			y -= offsetY || 0;
			width = 0;
			height = 0;
			if (!isAutoUpdateEvent || canTrackCursorOnAutoUpdate) {
				width = data.axis === "y" ? domRect.width : 0;
				height = data.axis === "x" ? domRect.height : 0;
				x = isXAxis && data.x != null ? data.x : x;
				y = isYAxis && data.y != null ? data.y : y;
			} else if (isAutoUpdateEvent && !canTrackCursorOnAutoUpdate) {
				height = data.axis === "x" ? domRect.height : height;
				width = data.axis === "y" ? domRect.width : width;
			}
			isAutoUpdateEvent = true;
			return {
				width,
				height,
				x,
				y,
				top: y,
				right: x + width,
				bottom: y + height,
				left: x
			};
		}
	};
}
function isMouseBasedEvent(event) {
	return event != null && event.clientX != null;
}
/**
* Positions the floating element relative to a client point (in the viewport),
* such as the mouse position. By default, it follows the mouse cursor.
* @see https://floating-ui.com/docs/useClientPoint
*/
function useClientPoint(context, props) {
	if (props === void 0) props = {};
	const { open, dataRef, elements: { floating, domReference }, refs } = context;
	const { enabled = true, axis = "both", x = null, y = null } = props;
	const initialRef = import_react.useRef(false);
	const cleanupListenerRef = import_react.useRef(null);
	const [pointerType, setPointerType] = import_react.useState();
	const [reactive, setReactive] = import_react.useState([]);
	const setReference = useEffectEvent((x, y) => {
		if (initialRef.current) return;
		if (dataRef.current.openEvent && !isMouseBasedEvent(dataRef.current.openEvent)) return;
		refs.setPositionReference(createVirtualElement(domReference, {
			x,
			y,
			axis,
			dataRef,
			pointerType
		}));
	});
	const handleReferenceEnterOrMove = useEffectEvent((event) => {
		if (x != null || y != null) return;
		if (!open) setReference(event.clientX, event.clientY);
		else if (!cleanupListenerRef.current) setReactive([]);
	});
	const openCheck = isMouseLikePointerType(pointerType) ? floating : open;
	const addListener = import_react.useCallback(() => {
		if (!openCheck || !enabled || x != null || y != null) return;
		const win = getWindow(floating);
		function handleMouseMove(event) {
			if (!contains$1(floating, getTarget$1(event))) setReference(event.clientX, event.clientY);
			else {
				win.removeEventListener("mousemove", handleMouseMove);
				cleanupListenerRef.current = null;
			}
		}
		if (!dataRef.current.openEvent || isMouseBasedEvent(dataRef.current.openEvent)) {
			win.addEventListener("mousemove", handleMouseMove);
			const cleanup = () => {
				win.removeEventListener("mousemove", handleMouseMove);
				cleanupListenerRef.current = null;
			};
			cleanupListenerRef.current = cleanup;
			return cleanup;
		}
		refs.setPositionReference(domReference);
	}, [
		openCheck,
		enabled,
		x,
		y,
		floating,
		dataRef,
		refs,
		domReference,
		setReference
	]);
	import_react.useEffect(() => {
		return addListener();
	}, [addListener, reactive]);
	import_react.useEffect(() => {
		if (enabled && !floating) initialRef.current = false;
	}, [enabled, floating]);
	import_react.useEffect(() => {
		if (!enabled && open) initialRef.current = true;
	}, [enabled, open]);
	index$1(() => {
		if (enabled && (x != null || y != null)) {
			initialRef.current = false;
			setReference(x, y);
		}
	}, [
		enabled,
		x,
		y,
		setReference
	]);
	const reference = import_react.useMemo(() => {
		function setPointerTypeRef(_ref) {
			let { pointerType } = _ref;
			setPointerType(pointerType);
		}
		return {
			onPointerDown: setPointerTypeRef,
			onPointerEnter: setPointerTypeRef,
			onMouseMove: handleReferenceEnterOrMove,
			onMouseEnter: handleReferenceEnterOrMove
		};
	}, [handleReferenceEnterOrMove]);
	return import_react.useMemo(() => enabled ? { reference } : {}, [enabled, reference]);
}
var bubbleHandlerKeys = {
	pointerdown: "onPointerDown",
	mousedown: "onMouseDown",
	click: "onClick"
};
var captureHandlerKeys = {
	pointerdown: "onPointerDownCapture",
	mousedown: "onMouseDownCapture",
	click: "onClickCapture"
};
var normalizeProp = (normalizable) => {
	var _normalizable$escapeK, _normalizable$outside;
	return {
		escapeKey: typeof normalizable === "boolean" ? normalizable : (_normalizable$escapeK = normalizable == null ? void 0 : normalizable.escapeKey) != null ? _normalizable$escapeK : false,
		outsidePress: typeof normalizable === "boolean" ? normalizable : (_normalizable$outside = normalizable == null ? void 0 : normalizable.outsidePress) != null ? _normalizable$outside : true
	};
};
/**
* Closes the floating element when a dismissal is requested — by default, when
* the user presses the `escape` key or outside of the floating element.
* @see https://floating-ui.com/docs/useDismiss
*/
function useDismiss(context, props) {
	if (props === void 0) props = {};
	const { open, onOpenChange, elements, dataRef } = context;
	const { enabled = true, escapeKey = true, outsidePress: unstable_outsidePress = true, outsidePressEvent = "pointerdown", referencePress = false, referencePressEvent = "pointerdown", ancestorScroll = false, bubbles, capture } = props;
	const tree = useFloatingTree();
	const outsidePressFn = useEffectEvent(typeof unstable_outsidePress === "function" ? unstable_outsidePress : () => false);
	const outsidePress = typeof unstable_outsidePress === "function" ? outsidePressFn : unstable_outsidePress;
	const endedOrStartedInsideRef = import_react.useRef(false);
	const { escapeKey: escapeKeyBubbles, outsidePress: outsidePressBubbles } = normalizeProp(bubbles);
	const { escapeKey: escapeKeyCapture, outsidePress: outsidePressCapture } = normalizeProp(capture);
	const isComposingRef = import_react.useRef(false);
	const closeOnEscapeKeyDown = useEffectEvent((event) => {
		var _dataRef$current$floa;
		if (!open || !enabled || !escapeKey || event.key !== "Escape") return;
		if (isComposingRef.current) return;
		const nodeId = (_dataRef$current$floa = dataRef.current.floatingContext) == null ? void 0 : _dataRef$current$floa.nodeId;
		const children = tree ? getNodeChildren$1(tree.nodesRef.current, nodeId) : [];
		if (!escapeKeyBubbles) {
			event.stopPropagation();
			if (children.length > 0) {
				let shouldDismiss = true;
				children.forEach((child) => {
					var _child$context;
					if ((_child$context = child.context) != null && _child$context.open && !child.context.dataRef.current.__escapeKeyBubbles) {
						shouldDismiss = false;
						return;
					}
				});
				if (!shouldDismiss) return;
			}
		}
		onOpenChange(false, isReactEvent(event) ? event.nativeEvent : event, "escape-key");
	});
	const closeOnEscapeKeyDownCapture = useEffectEvent((event) => {
		var _getTarget2;
		const callback = () => {
			var _getTarget;
			closeOnEscapeKeyDown(event);
			(_getTarget = getTarget$1(event)) == null || _getTarget.removeEventListener("keydown", callback);
		};
		(_getTarget2 = getTarget$1(event)) == null || _getTarget2.addEventListener("keydown", callback);
	});
	const closeOnPressOutside = useEffectEvent((event) => {
		var _dataRef$current$floa2;
		const insideReactTree = dataRef.current.insideReactTree;
		dataRef.current.insideReactTree = false;
		const endedOrStartedInside = endedOrStartedInsideRef.current;
		endedOrStartedInsideRef.current = false;
		if (outsidePressEvent === "click" && endedOrStartedInside) return;
		if (insideReactTree) return;
		if (typeof outsidePress === "function" && !outsidePress(event)) return;
		const target = getTarget$1(event);
		const inertSelector = "[" + createAttribute("inert") + "]";
		const markers = getDocument$1(elements.floating).querySelectorAll(inertSelector);
		let targetRootAncestor = isElement(target) ? target : null;
		while (targetRootAncestor && !isLastTraversableNode(targetRootAncestor)) {
			const nextParent = getParentNode(targetRootAncestor);
			if (isLastTraversableNode(nextParent) || !isElement(nextParent)) break;
			targetRootAncestor = nextParent;
		}
		if (markers.length && isElement(target) && !isRootElement(target) && !contains$1(target, elements.floating) && Array.from(markers).every((marker) => !contains$1(targetRootAncestor, marker))) return;
		if (isHTMLElement(target) && floating) {
			const lastTraversableNode = isLastTraversableNode(target);
			const style = getComputedStyle$1(target);
			const scrollRe = /auto|scroll/;
			const isScrollableX = lastTraversableNode || scrollRe.test(style.overflowX);
			const isScrollableY = lastTraversableNode || scrollRe.test(style.overflowY);
			const canScrollX = isScrollableX && target.clientWidth > 0 && target.scrollWidth > target.clientWidth;
			const canScrollY = isScrollableY && target.clientHeight > 0 && target.scrollHeight > target.clientHeight;
			const isRTL = style.direction === "rtl";
			const pressedVerticalScrollbar = canScrollY && (isRTL ? event.offsetX <= target.offsetWidth - target.clientWidth : event.offsetX > target.clientWidth);
			const pressedHorizontalScrollbar = canScrollX && event.offsetY > target.clientHeight;
			if (pressedVerticalScrollbar || pressedHorizontalScrollbar) return;
		}
		const nodeId = (_dataRef$current$floa2 = dataRef.current.floatingContext) == null ? void 0 : _dataRef$current$floa2.nodeId;
		const targetIsInsideChildren = tree && getNodeChildren$1(tree.nodesRef.current, nodeId).some((node) => {
			var _node$context;
			return isEventTargetWithin(event, (_node$context = node.context) == null ? void 0 : _node$context.elements.floating);
		});
		if (isEventTargetWithin(event, elements.floating) || isEventTargetWithin(event, elements.domReference) || targetIsInsideChildren) return;
		const children = tree ? getNodeChildren$1(tree.nodesRef.current, nodeId) : [];
		if (children.length > 0) {
			let shouldDismiss = true;
			children.forEach((child) => {
				var _child$context2;
				if ((_child$context2 = child.context) != null && _child$context2.open && !child.context.dataRef.current.__outsidePressBubbles) {
					shouldDismiss = false;
					return;
				}
			});
			if (!shouldDismiss) return;
		}
		onOpenChange(false, event, "outside-press");
	});
	const closeOnPressOutsideCapture = useEffectEvent((event) => {
		var _getTarget4;
		const callback = () => {
			var _getTarget3;
			closeOnPressOutside(event);
			(_getTarget3 = getTarget$1(event)) == null || _getTarget3.removeEventListener(outsidePressEvent, callback);
		};
		(_getTarget4 = getTarget$1(event)) == null || _getTarget4.addEventListener(outsidePressEvent, callback);
	});
	import_react.useEffect(() => {
		if (!open || !enabled) return;
		dataRef.current.__escapeKeyBubbles = escapeKeyBubbles;
		dataRef.current.__outsidePressBubbles = outsidePressBubbles;
		let compositionTimeout = -1;
		function onScroll(event) {
			onOpenChange(false, event, "ancestor-scroll");
		}
		function handleCompositionStart() {
			window.clearTimeout(compositionTimeout);
			isComposingRef.current = true;
		}
		function handleCompositionEnd() {
			compositionTimeout = window.setTimeout(() => {
				isComposingRef.current = false;
			}, isWebKit() ? 5 : 0);
		}
		const doc = getDocument$1(elements.floating);
		if (escapeKey) {
			doc.addEventListener("keydown", escapeKeyCapture ? closeOnEscapeKeyDownCapture : closeOnEscapeKeyDown, escapeKeyCapture);
			doc.addEventListener("compositionstart", handleCompositionStart);
			doc.addEventListener("compositionend", handleCompositionEnd);
		}
		outsidePress && doc.addEventListener(outsidePressEvent, outsidePressCapture ? closeOnPressOutsideCapture : closeOnPressOutside, outsidePressCapture);
		let ancestors = [];
		if (ancestorScroll) {
			if (isElement(elements.domReference)) ancestors = getOverflowAncestors(elements.domReference);
			if (isElement(elements.floating)) ancestors = ancestors.concat(getOverflowAncestors(elements.floating));
			if (!isElement(elements.reference) && elements.reference && elements.reference.contextElement) ancestors = ancestors.concat(getOverflowAncestors(elements.reference.contextElement));
		}
		ancestors = ancestors.filter((ancestor) => {
			var _doc$defaultView;
			return ancestor !== ((_doc$defaultView = doc.defaultView) == null ? void 0 : _doc$defaultView.visualViewport);
		});
		ancestors.forEach((ancestor) => {
			ancestor.addEventListener("scroll", onScroll, { passive: true });
		});
		return () => {
			if (escapeKey) {
				doc.removeEventListener("keydown", escapeKeyCapture ? closeOnEscapeKeyDownCapture : closeOnEscapeKeyDown, escapeKeyCapture);
				doc.removeEventListener("compositionstart", handleCompositionStart);
				doc.removeEventListener("compositionend", handleCompositionEnd);
			}
			outsidePress && doc.removeEventListener(outsidePressEvent, outsidePressCapture ? closeOnPressOutsideCapture : closeOnPressOutside, outsidePressCapture);
			ancestors.forEach((ancestor) => {
				ancestor.removeEventListener("scroll", onScroll);
			});
			window.clearTimeout(compositionTimeout);
		};
	}, [
		dataRef,
		elements,
		escapeKey,
		outsidePress,
		outsidePressEvent,
		open,
		onOpenChange,
		ancestorScroll,
		enabled,
		escapeKeyBubbles,
		outsidePressBubbles,
		closeOnEscapeKeyDown,
		escapeKeyCapture,
		closeOnEscapeKeyDownCapture,
		closeOnPressOutside,
		outsidePressCapture,
		closeOnPressOutsideCapture
	]);
	import_react.useEffect(() => {
		dataRef.current.insideReactTree = false;
	}, [
		dataRef,
		outsidePress,
		outsidePressEvent
	]);
	const reference = import_react.useMemo(() => ({
		onKeyDown: closeOnEscapeKeyDown,
		...referencePress && {
			[bubbleHandlerKeys[referencePressEvent]]: (event) => {
				onOpenChange(false, event.nativeEvent, "reference-press");
			},
			...referencePressEvent !== "click" && { onClick(event) {
				onOpenChange(false, event.nativeEvent, "reference-press");
			} }
		}
	}), [
		closeOnEscapeKeyDown,
		onOpenChange,
		referencePress,
		referencePressEvent
	]);
	const floating = import_react.useMemo(() => ({
		onKeyDown: closeOnEscapeKeyDown,
		onMouseDown() {
			endedOrStartedInsideRef.current = true;
		},
		onMouseUp() {
			endedOrStartedInsideRef.current = true;
		},
		[captureHandlerKeys[outsidePressEvent]]: () => {
			dataRef.current.insideReactTree = true;
		}
	}), [
		closeOnEscapeKeyDown,
		outsidePressEvent,
		dataRef
	]);
	return import_react.useMemo(() => enabled ? {
		reference,
		floating
	} : {}, [
		enabled,
		reference,
		floating
	]);
}
function useFloatingRootContext(options) {
	const { open = false, onOpenChange: onOpenChangeProp, elements: elementsProp } = options;
	const floatingId = useId();
	const dataRef = import_react.useRef({});
	const [events] = import_react.useState(() => createEventEmitter());
	const nested = useFloatingParentNodeId() != null;
	{
		const optionDomReference = elementsProp.reference;
		if (optionDomReference && !isElement(optionDomReference)) error("Cannot pass a virtual element to the `elements.reference` option,", "as it must be a real DOM element. Use `refs.setPositionReference()`", "instead.");
	}
	const [positionReference, setPositionReference] = import_react.useState(elementsProp.reference);
	const onOpenChange = useEffectEvent((open, event, reason) => {
		dataRef.current.openEvent = open ? event : void 0;
		events.emit("openchange", {
			open,
			event,
			reason,
			nested
		});
		onOpenChangeProp?.(open, event, reason);
	});
	const refs = import_react.useMemo(() => ({ setPositionReference }), []);
	const elements = import_react.useMemo(() => ({
		reference: positionReference || elementsProp.reference || null,
		floating: elementsProp.floating || null,
		domReference: elementsProp.reference
	}), [
		positionReference,
		elementsProp.reference,
		elementsProp.floating
	]);
	return import_react.useMemo(() => ({
		dataRef,
		open,
		onOpenChange,
		elements,
		events,
		floatingId,
		refs
	}), [
		open,
		onOpenChange,
		elements,
		events,
		floatingId,
		refs
	]);
}
/**
* Provides data to position a floating element and context to add interactions.
* @see https://floating-ui.com/docs/useFloating
*/
function useFloating(options) {
	if (options === void 0) options = {};
	const { nodeId } = options;
	const internalRootContext = useFloatingRootContext({
		...options,
		elements: {
			reference: null,
			floating: null,
			...options.elements
		}
	});
	const rootContext = options.rootContext || internalRootContext;
	const computedElements = rootContext.elements;
	const [_domReference, setDomReference] = import_react.useState(null);
	const [positionReference, _setPositionReference] = import_react.useState(null);
	const domReference = (computedElements == null ? void 0 : computedElements.domReference) || _domReference;
	const domReferenceRef = import_react.useRef(null);
	const tree = useFloatingTree();
	index$1(() => {
		if (domReference) domReferenceRef.current = domReference;
	}, [domReference]);
	const position = useFloating$1({
		...options,
		elements: {
			...computedElements,
			...positionReference && { reference: positionReference }
		}
	});
	const setPositionReference = import_react.useCallback((node) => {
		const computedPositionReference = isElement(node) ? {
			getBoundingClientRect: () => node.getBoundingClientRect(),
			getClientRects: () => node.getClientRects(),
			contextElement: node
		} : node;
		_setPositionReference(computedPositionReference);
		position.refs.setReference(computedPositionReference);
	}, [position.refs]);
	const setReference = import_react.useCallback((node) => {
		if (isElement(node) || node === null) {
			domReferenceRef.current = node;
			setDomReference(node);
		}
		if (isElement(position.refs.reference.current) || position.refs.reference.current === null || node !== null && !isElement(node)) position.refs.setReference(node);
	}, [position.refs]);
	const refs = import_react.useMemo(() => ({
		...position.refs,
		setReference,
		setPositionReference,
		domReference: domReferenceRef
	}), [
		position.refs,
		setReference,
		setPositionReference
	]);
	const elements = import_react.useMemo(() => ({
		...position.elements,
		domReference
	}), [position.elements, domReference]);
	const context = import_react.useMemo(() => ({
		...position,
		...rootContext,
		refs,
		elements,
		nodeId
	}), [
		position,
		refs,
		elements,
		nodeId,
		rootContext
	]);
	index$1(() => {
		rootContext.dataRef.current.floatingContext = context;
		const node = tree == null ? void 0 : tree.nodesRef.current.find((node) => node.id === nodeId);
		if (node) node.context = context;
	});
	return import_react.useMemo(() => ({
		...position,
		context,
		refs,
		elements
	}), [
		position,
		refs,
		elements,
		context
	]);
}
function isMacSafari() {
	return isMac() && isSafari();
}
/**
* Opens the floating element while the reference element has focus, like CSS
* `:focus`.
* @see https://floating-ui.com/docs/useFocus
*/
function useFocus(context, props) {
	if (props === void 0) props = {};
	const { open, onOpenChange, events, dataRef, elements } = context;
	const { enabled = true, visibleOnly = true } = props;
	const blockFocusRef = import_react.useRef(false);
	const timeoutRef = import_react.useRef(-1);
	const keyboardModalityRef = import_react.useRef(true);
	import_react.useEffect(() => {
		if (!enabled) return;
		const win = getWindow(elements.domReference);
		function onBlur() {
			if (!open && isHTMLElement(elements.domReference) && elements.domReference === activeElement(getDocument$1(elements.domReference))) blockFocusRef.current = true;
		}
		function onKeyDown() {
			keyboardModalityRef.current = true;
		}
		function onPointerDown() {
			keyboardModalityRef.current = false;
		}
		win.addEventListener("blur", onBlur);
		if (isMacSafari()) {
			win.addEventListener("keydown", onKeyDown, true);
			win.addEventListener("pointerdown", onPointerDown, true);
		}
		return () => {
			win.removeEventListener("blur", onBlur);
			if (isMacSafari()) {
				win.removeEventListener("keydown", onKeyDown, true);
				win.removeEventListener("pointerdown", onPointerDown, true);
			}
		};
	}, [
		elements.domReference,
		open,
		enabled
	]);
	import_react.useEffect(() => {
		if (!enabled) return;
		function onOpenChange(_ref) {
			let { reason } = _ref;
			if (reason === "reference-press" || reason === "escape-key") blockFocusRef.current = true;
		}
		events.on("openchange", onOpenChange);
		return () => {
			events.off("openchange", onOpenChange);
		};
	}, [events, enabled]);
	import_react.useEffect(() => {
		return () => {
			clearTimeoutIfSet(timeoutRef);
		};
	}, []);
	const reference = import_react.useMemo(() => ({
		onMouseLeave() {
			blockFocusRef.current = false;
		},
		onFocus(event) {
			if (blockFocusRef.current) return;
			const target = getTarget$1(event.nativeEvent);
			if (visibleOnly && isElement(target)) {
				if (isMacSafari() && !event.relatedTarget) {
					if (!keyboardModalityRef.current && !isTypeableElement(target)) return;
				} else if (!matchesFocusVisible(target)) return;
			}
			onOpenChange(true, event.nativeEvent, "focus");
		},
		onBlur(event) {
			blockFocusRef.current = false;
			const relatedTarget = event.relatedTarget;
			const nativeEvent = event.nativeEvent;
			const movedToFocusGuard = isElement(relatedTarget) && relatedTarget.hasAttribute(createAttribute("focus-guard")) && relatedTarget.getAttribute("data-type") === "outside";
			timeoutRef.current = window.setTimeout(() => {
				var _dataRef$current$floa;
				const activeEl = activeElement(elements.domReference ? elements.domReference.ownerDocument : document);
				if (!relatedTarget && activeEl === elements.domReference) return;
				if (contains$1((_dataRef$current$floa = dataRef.current.floatingContext) == null ? void 0 : _dataRef$current$floa.refs.floating.current, activeEl) || contains$1(elements.domReference, activeEl) || movedToFocusGuard) return;
				onOpenChange(false, nativeEvent, "focus");
			});
		}
	}), [
		dataRef,
		elements.domReference,
		onOpenChange,
		visibleOnly
	]);
	return import_react.useMemo(() => enabled ? { reference } : {}, [enabled, reference]);
}
function mergeProps(userProps, propsList, elementKey) {
	const map = /* @__PURE__ */ new Map();
	const isItem = elementKey === "item";
	let domUserProps = userProps;
	if (isItem && userProps) {
		const { [ACTIVE_KEY]: _, [SELECTED_KEY]: __, ...validProps } = userProps;
		domUserProps = validProps;
	}
	return {
		...elementKey === "floating" && {
			tabIndex: -1,
			[FOCUSABLE_ATTRIBUTE]: ""
		},
		...domUserProps,
		...propsList.map((value) => {
			const propsOrGetProps = value ? value[elementKey] : null;
			if (typeof propsOrGetProps === "function") return userProps ? propsOrGetProps(userProps) : null;
			return propsOrGetProps;
		}).concat(userProps).reduce((acc, props) => {
			if (!props) return acc;
			Object.entries(props).forEach((_ref) => {
				let [key, value] = _ref;
				if (isItem && [ACTIVE_KEY, SELECTED_KEY].includes(key)) return;
				if (key.indexOf("on") === 0) {
					if (!map.has(key)) map.set(key, []);
					if (typeof value === "function") {
						var _map$get;
						(_map$get = map.get(key)) == null || _map$get.push(value);
						acc[key] = function() {
							var _map$get2;
							for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
							return (_map$get2 = map.get(key)) == null ? void 0 : _map$get2.map((fn) => fn(...args)).find((val) => val !== void 0);
						};
					}
				} else acc[key] = value;
			});
			return acc;
		}, {})
	};
}
/**
* Merges an array of interaction hooks' props into prop getters, allowing
* event handler functions to be composed together without overwriting one
* another.
* @see https://floating-ui.com/docs/useInteractions
*/
function useInteractions(propsList) {
	if (propsList === void 0) propsList = [];
	const referenceDeps = propsList.map((key) => key == null ? void 0 : key.reference);
	const floatingDeps = propsList.map((key) => key == null ? void 0 : key.floating);
	const itemDeps = propsList.map((key) => key == null ? void 0 : key.item);
	const getReferenceProps = import_react.useCallback((userProps) => mergeProps(userProps, propsList, "reference"), referenceDeps);
	const getFloatingProps = import_react.useCallback((userProps) => mergeProps(userProps, propsList, "floating"), floatingDeps);
	const getItemProps = import_react.useCallback((userProps) => mergeProps(userProps, propsList, "item"), itemDeps);
	return import_react.useMemo(() => ({
		getReferenceProps,
		getFloatingProps,
		getItemProps
	}), [
		getReferenceProps,
		getFloatingProps,
		getItemProps
	]);
}
var ESCAPE = "Escape";
function doSwitch(orientation, vertical, horizontal) {
	switch (orientation) {
		case "vertical": return vertical;
		case "horizontal": return horizontal;
		default: return vertical || horizontal;
	}
}
function isMainOrientationKey(key, orientation) {
	return doSwitch(orientation, key === ARROW_UP || key === ARROW_DOWN, key === ARROW_LEFT || key === ARROW_RIGHT);
}
function isMainOrientationToEndKey(key, orientation, rtl) {
	return doSwitch(orientation, key === ARROW_DOWN, rtl ? key === ARROW_LEFT : key === ARROW_RIGHT) || key === "Enter" || key === " " || key === "";
}
function isCrossOrientationOpenKey(key, orientation, rtl) {
	return doSwitch(orientation, rtl ? key === ARROW_LEFT : key === ARROW_RIGHT, key === ARROW_DOWN);
}
function isCrossOrientationCloseKey(key, orientation, rtl, cols) {
	const vertical = rtl ? key === ARROW_RIGHT : key === ARROW_LEFT;
	const horizontal = key === ARROW_UP;
	if (orientation === "both" || orientation === "horizontal" && cols && cols > 1) return key === ESCAPE;
	return doSwitch(orientation, vertical, horizontal);
}
/**
* Adds arrow key-based navigation of a list of items, either using real DOM
* focus or virtual focus.
* @see https://floating-ui.com/docs/useListNavigation
*/
function useListNavigation(context, props) {
	const { open, onOpenChange, elements, floatingId } = context;
	const { listRef, activeIndex, onNavigate: unstable_onNavigate = () => {}, enabled = true, selectedIndex = null, allowEscape = false, loop = false, nested = false, rtl = false, virtual = false, focusItemOnOpen = "auto", focusItemOnHover = true, openOnArrowKeyDown = true, disabledIndices = void 0, orientation = "vertical", parentOrientation, cols = 1, scrollItemIntoView = true, virtualItemRef, itemSizes, dense = false } = props;
	if (allowEscape) {
		if (!loop) warn("`useListNavigation` looping must be enabled to allow escaping.");
		if (!virtual) warn("`useListNavigation` must be virtual to allow escaping.");
	}
	if (orientation === "vertical" && cols > 1) warn("In grid list navigation mode (`cols` > 1), the `orientation` should", "be either \"horizontal\" or \"both\".");
	const floatingFocusElementRef = useLatestRef$1(getFloatingFocusElement(elements.floating));
	const parentId = useFloatingParentNodeId();
	const tree = useFloatingTree();
	index$1(() => {
		context.dataRef.current.orientation = orientation;
	}, [context, orientation]);
	const onNavigate = useEffectEvent(() => {
		unstable_onNavigate(indexRef.current === -1 ? null : indexRef.current);
	});
	const typeableComboboxReference = isTypeableCombobox(elements.domReference);
	const focusItemOnOpenRef = import_react.useRef(focusItemOnOpen);
	const indexRef = import_react.useRef(selectedIndex != null ? selectedIndex : -1);
	const keyRef = import_react.useRef(null);
	const isPointerModalityRef = import_react.useRef(true);
	const previousOnNavigateRef = import_react.useRef(onNavigate);
	const previousMountedRef = import_react.useRef(!!elements.floating);
	const previousOpenRef = import_react.useRef(open);
	const forceSyncFocusRef = import_react.useRef(false);
	const forceScrollIntoViewRef = import_react.useRef(false);
	const disabledIndicesRef = useLatestRef$1(disabledIndices);
	const latestOpenRef = useLatestRef$1(open);
	const scrollItemIntoViewRef = useLatestRef$1(scrollItemIntoView);
	const selectedIndexRef = useLatestRef$1(selectedIndex);
	const [activeId, setActiveId] = import_react.useState();
	const [virtualId, setVirtualId] = import_react.useState();
	const focusItem = useEffectEvent(() => {
		function runFocus(item) {
			if (virtual) {
				var _item$id;
				if ((_item$id = item.id) != null && _item$id.endsWith("-fui-option")) item.id = floatingId + "-" + Math.random().toString(16).slice(2, 10);
				setActiveId(item.id);
				tree?.events.emit("virtualfocus", item);
				if (virtualItemRef) virtualItemRef.current = item;
			} else enqueueFocus(item, {
				sync: forceSyncFocusRef.current,
				preventScroll: true
			});
		}
		const initialItem = listRef.current[indexRef.current];
		const forceScrollIntoView = forceScrollIntoViewRef.current;
		if (initialItem) runFocus(initialItem);
		(forceSyncFocusRef.current ? (v) => v() : requestAnimationFrame)(() => {
			const waitedItem = listRef.current[indexRef.current] || initialItem;
			if (!waitedItem) return;
			if (!initialItem) runFocus(waitedItem);
			const scrollIntoViewOptions = scrollItemIntoViewRef.current;
			if (scrollIntoViewOptions && item && (forceScrollIntoView || !isPointerModalityRef.current)) waitedItem.scrollIntoView == null || waitedItem.scrollIntoView(typeof scrollIntoViewOptions === "boolean" ? {
				block: "nearest",
				inline: "nearest"
			} : scrollIntoViewOptions);
		});
	});
	index$1(() => {
		if (!enabled) return;
		if (open && elements.floating) {
			if (focusItemOnOpenRef.current && selectedIndex != null) {
				forceScrollIntoViewRef.current = true;
				indexRef.current = selectedIndex;
				onNavigate();
			}
		} else if (previousMountedRef.current) {
			indexRef.current = -1;
			previousOnNavigateRef.current();
		}
	}, [
		enabled,
		open,
		elements.floating,
		selectedIndex,
		onNavigate
	]);
	index$1(() => {
		if (!enabled) return;
		if (!open) return;
		if (!elements.floating) return;
		if (activeIndex == null) {
			forceSyncFocusRef.current = false;
			if (selectedIndexRef.current != null) return;
			if (previousMountedRef.current) {
				indexRef.current = -1;
				focusItem();
			}
			if ((!previousOpenRef.current || !previousMountedRef.current) && focusItemOnOpenRef.current && (keyRef.current != null || focusItemOnOpenRef.current === true && keyRef.current == null)) {
				let runs = 0;
				const waitForListPopulated = () => {
					if (listRef.current[0] == null) {
						if (runs < 2) (runs ? requestAnimationFrame : queueMicrotask)(waitForListPopulated);
						runs++;
					} else {
						indexRef.current = keyRef.current == null || isMainOrientationToEndKey(keyRef.current, orientation, rtl) || nested ? getMinListIndex(listRef, disabledIndicesRef.current) : getMaxListIndex(listRef, disabledIndicesRef.current);
						keyRef.current = null;
						onNavigate();
					}
				};
				waitForListPopulated();
			}
		} else if (!isIndexOutOfListBounds(listRef, activeIndex)) {
			indexRef.current = activeIndex;
			focusItem();
			forceScrollIntoViewRef.current = false;
		}
	}, [
		enabled,
		open,
		elements.floating,
		activeIndex,
		selectedIndexRef,
		nested,
		listRef,
		orientation,
		rtl,
		onNavigate,
		focusItem,
		disabledIndicesRef
	]);
	index$1(() => {
		var _nodes$find;
		if (!enabled || elements.floating || !tree || virtual || !previousMountedRef.current) return;
		const nodes = tree.nodesRef.current;
		const parent = (_nodes$find = nodes.find((node) => node.id === parentId)) == null || (_nodes$find = _nodes$find.context) == null ? void 0 : _nodes$find.elements.floating;
		const activeEl = activeElement(getDocument$1(elements.floating));
		const treeContainsActiveEl = nodes.some((node) => node.context && contains$1(node.context.elements.floating, activeEl));
		if (parent && !treeContainsActiveEl && isPointerModalityRef.current) parent.focus({ preventScroll: true });
	}, [
		enabled,
		elements.floating,
		tree,
		parentId,
		virtual
	]);
	index$1(() => {
		if (!enabled) return;
		if (!tree) return;
		if (!virtual) return;
		if (parentId) return;
		function handleVirtualFocus(item) {
			setVirtualId(item.id);
			if (virtualItemRef) virtualItemRef.current = item;
		}
		tree.events.on("virtualfocus", handleVirtualFocus);
		return () => {
			tree.events.off("virtualfocus", handleVirtualFocus);
		};
	}, [
		enabled,
		tree,
		virtual,
		parentId,
		virtualItemRef
	]);
	index$1(() => {
		previousOnNavigateRef.current = onNavigate;
		previousOpenRef.current = open;
		previousMountedRef.current = !!elements.floating;
	});
	index$1(() => {
		if (!open) {
			keyRef.current = null;
			focusItemOnOpenRef.current = focusItemOnOpen;
		}
	}, [open, focusItemOnOpen]);
	const hasActiveIndex = activeIndex != null;
	const item = import_react.useMemo(() => {
		function syncCurrentTarget(currentTarget) {
			if (!latestOpenRef.current) return;
			const index = listRef.current.indexOf(currentTarget);
			if (index !== -1 && indexRef.current !== index) {
				indexRef.current = index;
				onNavigate();
			}
		}
		return {
			onFocus(_ref) {
				let { currentTarget } = _ref;
				forceSyncFocusRef.current = true;
				syncCurrentTarget(currentTarget);
			},
			onClick: (_ref2) => {
				let { currentTarget } = _ref2;
				return currentTarget.focus({ preventScroll: true });
			},
			onMouseMove(_ref3) {
				let { currentTarget } = _ref3;
				forceSyncFocusRef.current = true;
				forceScrollIntoViewRef.current = false;
				if (focusItemOnHover) syncCurrentTarget(currentTarget);
			},
			onPointerLeave(_ref4) {
				let { pointerType } = _ref4;
				if (!isPointerModalityRef.current || pointerType === "touch") return;
				forceSyncFocusRef.current = true;
				if (!focusItemOnHover) return;
				indexRef.current = -1;
				onNavigate();
				if (!virtual) {
					var _floatingFocusElement;
					(_floatingFocusElement = floatingFocusElementRef.current) == null || _floatingFocusElement.focus({ preventScroll: true });
				}
			}
		};
	}, [
		latestOpenRef,
		floatingFocusElementRef,
		focusItemOnHover,
		listRef,
		onNavigate,
		virtual
	]);
	const getParentOrientation = import_react.useCallback(() => {
		var _tree$nodesRef$curren;
		return parentOrientation != null ? parentOrientation : tree == null || (_tree$nodesRef$curren = tree.nodesRef.current.find((node) => node.id === parentId)) == null || (_tree$nodesRef$curren = _tree$nodesRef$curren.context) == null || (_tree$nodesRef$curren = _tree$nodesRef$curren.dataRef) == null ? void 0 : _tree$nodesRef$curren.current.orientation;
	}, [
		parentId,
		tree,
		parentOrientation
	]);
	const commonOnKeyDown = useEffectEvent((event) => {
		isPointerModalityRef.current = false;
		forceSyncFocusRef.current = true;
		if (event.which === 229) return;
		if (!latestOpenRef.current && event.currentTarget === floatingFocusElementRef.current) return;
		if (nested && isCrossOrientationCloseKey(event.key, orientation, rtl, cols)) {
			if (!isMainOrientationKey(event.key, getParentOrientation())) stopEvent(event);
			onOpenChange(false, event.nativeEvent, "list-navigation");
			if (isHTMLElement(elements.domReference)) if (virtual) tree?.events.emit("virtualfocus", elements.domReference);
			else elements.domReference.focus();
			return;
		}
		const currentIndex = indexRef.current;
		const minIndex = getMinListIndex(listRef, disabledIndices);
		const maxIndex = getMaxListIndex(listRef, disabledIndices);
		if (!typeableComboboxReference) {
			if (event.key === "Home") {
				stopEvent(event);
				indexRef.current = minIndex;
				onNavigate();
			}
			if (event.key === "End") {
				stopEvent(event);
				indexRef.current = maxIndex;
				onNavigate();
			}
		}
		if (cols > 1) {
			const sizes = itemSizes || Array.from({ length: listRef.current.length }, () => ({
				width: 1,
				height: 1
			}));
			const cellMap = createGridCellMap(sizes, cols, dense);
			const minGridIndex = cellMap.findIndex((index) => index != null && !isListIndexDisabled(listRef, index, disabledIndices));
			const maxGridIndex = cellMap.reduce((foundIndex, index, cellIndex) => index != null && !isListIndexDisabled(listRef, index, disabledIndices) ? cellIndex : foundIndex, -1);
			const index = cellMap[getGridNavigatedIndex({ current: cellMap.map((itemIndex) => itemIndex != null ? listRef.current[itemIndex] : null) }, {
				event,
				orientation,
				loop,
				rtl,
				cols,
				disabledIndices: getGridCellIndices([...(typeof disabledIndices !== "function" ? disabledIndices : null) || listRef.current.map((_, index) => isListIndexDisabled(listRef, index, disabledIndices) ? index : void 0), void 0], cellMap),
				minIndex: minGridIndex,
				maxIndex: maxGridIndex,
				prevIndex: getGridCellIndexOfCorner(indexRef.current > maxIndex ? minIndex : indexRef.current, sizes, cellMap, cols, event.key === ARROW_DOWN ? "bl" : event.key === (rtl ? ARROW_LEFT : ARROW_RIGHT) ? "tr" : "tl"),
				stopEvent: true
			})];
			if (index != null) {
				indexRef.current = index;
				onNavigate();
			}
			if (orientation === "both") return;
		}
		if (isMainOrientationKey(event.key, orientation)) {
			stopEvent(event);
			if (open && !virtual && activeElement(event.currentTarget.ownerDocument) === event.currentTarget) {
				indexRef.current = isMainOrientationToEndKey(event.key, orientation, rtl) ? minIndex : maxIndex;
				onNavigate();
				return;
			}
			if (isMainOrientationToEndKey(event.key, orientation, rtl)) if (loop) indexRef.current = currentIndex >= maxIndex ? allowEscape && currentIndex !== listRef.current.length ? -1 : minIndex : findNonDisabledListIndex(listRef, {
				startingIndex: currentIndex,
				disabledIndices
			});
			else indexRef.current = Math.min(maxIndex, findNonDisabledListIndex(listRef, {
				startingIndex: currentIndex,
				disabledIndices
			}));
			else if (loop) indexRef.current = currentIndex <= minIndex ? allowEscape && currentIndex !== -1 ? listRef.current.length : maxIndex : findNonDisabledListIndex(listRef, {
				startingIndex: currentIndex,
				decrement: true,
				disabledIndices
			});
			else indexRef.current = Math.max(minIndex, findNonDisabledListIndex(listRef, {
				startingIndex: currentIndex,
				decrement: true,
				disabledIndices
			}));
			if (isIndexOutOfListBounds(listRef, indexRef.current)) indexRef.current = -1;
			onNavigate();
		}
	});
	const ariaActiveDescendantProp = import_react.useMemo(() => {
		return virtual && open && hasActiveIndex && { "aria-activedescendant": virtualId || activeId };
	}, [
		virtual,
		open,
		hasActiveIndex,
		virtualId,
		activeId
	]);
	const floating = import_react.useMemo(() => {
		return {
			"aria-orientation": orientation === "both" ? void 0 : orientation,
			...!typeableComboboxReference ? ariaActiveDescendantProp : {},
			onKeyDown: commonOnKeyDown,
			onPointerMove() {
				isPointerModalityRef.current = true;
			}
		};
	}, [
		ariaActiveDescendantProp,
		commonOnKeyDown,
		orientation,
		typeableComboboxReference
	]);
	const reference = import_react.useMemo(() => {
		function checkVirtualMouse(event) {
			if (focusItemOnOpen === "auto" && isVirtualClick(event.nativeEvent)) focusItemOnOpenRef.current = true;
		}
		function checkVirtualPointer(event) {
			focusItemOnOpenRef.current = focusItemOnOpen;
			if (focusItemOnOpen === "auto" && isVirtualPointerEvent(event.nativeEvent)) focusItemOnOpenRef.current = true;
		}
		return {
			...ariaActiveDescendantProp,
			onKeyDown(event) {
				isPointerModalityRef.current = false;
				const isArrowKey = event.key.startsWith("Arrow");
				const isHomeOrEndKey = ["Home", "End"].includes(event.key);
				const isMoveKey = isArrowKey || isHomeOrEndKey;
				const isCrossOpenKey = isCrossOrientationOpenKey(event.key, orientation, rtl);
				const isCrossCloseKey = isCrossOrientationCloseKey(event.key, orientation, rtl, cols);
				const isParentCrossOpenKey = isCrossOrientationOpenKey(event.key, getParentOrientation(), rtl);
				const isMainKey = isMainOrientationKey(event.key, orientation);
				const isNavigationKey = (nested ? isParentCrossOpenKey : isMainKey) || event.key === "Enter" || event.key.trim() === "";
				if (virtual && open) {
					const rootNode = tree == null ? void 0 : tree.nodesRef.current.find((node) => node.parentId == null);
					const deepestNode = tree && rootNode ? getDeepestNode(tree.nodesRef.current, rootNode.id) : null;
					if (isMoveKey && deepestNode && virtualItemRef) {
						const eventObject = new KeyboardEvent("keydown", {
							key: event.key,
							bubbles: true
						});
						if (isCrossOpenKey || isCrossCloseKey) {
							var _deepestNode$context, _deepestNode$context2;
							const isCurrentTarget = ((_deepestNode$context = deepestNode.context) == null ? void 0 : _deepestNode$context.elements.domReference) === event.currentTarget;
							const dispatchItem = isCrossCloseKey && !isCurrentTarget ? (_deepestNode$context2 = deepestNode.context) == null ? void 0 : _deepestNode$context2.elements.domReference : isCrossOpenKey ? listRef.current.find((item) => (item == null ? void 0 : item.id) === activeId) : null;
							if (dispatchItem) {
								stopEvent(event);
								dispatchItem.dispatchEvent(eventObject);
								setVirtualId(void 0);
							}
						}
						if ((isMainKey || isHomeOrEndKey) && deepestNode.context) {
							if (deepestNode.context.open && deepestNode.parentId && event.currentTarget !== deepestNode.context.elements.domReference) {
								var _deepestNode$context$;
								stopEvent(event);
								(_deepestNode$context$ = deepestNode.context.elements.domReference) == null || _deepestNode$context$.dispatchEvent(eventObject);
								return;
							}
						}
					}
					return commonOnKeyDown(event);
				}
				if (!open && !openOnArrowKeyDown && isArrowKey) return;
				if (isNavigationKey) {
					const isParentMainKey = isMainOrientationKey(event.key, getParentOrientation());
					keyRef.current = nested && isParentMainKey ? null : event.key;
				}
				if (nested) {
					if (isParentCrossOpenKey) {
						stopEvent(event);
						if (open) {
							indexRef.current = getMinListIndex(listRef, disabledIndicesRef.current);
							onNavigate();
						} else onOpenChange(true, event.nativeEvent, "list-navigation");
					}
					return;
				}
				if (isMainKey) {
					if (selectedIndex != null) indexRef.current = selectedIndex;
					stopEvent(event);
					if (!open && openOnArrowKeyDown) onOpenChange(true, event.nativeEvent, "list-navigation");
					else commonOnKeyDown(event);
					if (open) onNavigate();
				}
			},
			onFocus() {
				if (open && !virtual) {
					indexRef.current = -1;
					onNavigate();
				}
			},
			onPointerDown: checkVirtualPointer,
			onPointerEnter: checkVirtualPointer,
			onMouseDown: checkVirtualMouse,
			onClick: checkVirtualMouse
		};
	}, [
		activeId,
		ariaActiveDescendantProp,
		cols,
		commonOnKeyDown,
		disabledIndicesRef,
		focusItemOnOpen,
		listRef,
		nested,
		onNavigate,
		onOpenChange,
		open,
		openOnArrowKeyDown,
		orientation,
		getParentOrientation,
		rtl,
		selectedIndex,
		tree,
		virtual,
		virtualItemRef
	]);
	return import_react.useMemo(() => enabled ? {
		reference,
		floating,
		item
	} : {}, [
		enabled,
		reference,
		floating,
		item
	]);
}
var componentRoleToAriaRoleMap = /* @__PURE__ */ new Map([
	["select", "listbox"],
	["combobox", "listbox"],
	["label", false]
]);
/**
* Adds base screen reader props to the reference and floating elements for a
* given floating element `role`.
* @see https://floating-ui.com/docs/useRole
*/
function useRole(context, props) {
	var _elements$domReferenc, _componentRoleToAriaR;
	if (props === void 0) props = {};
	const { open, elements, floatingId: defaultFloatingId } = context;
	const { enabled = true, role = "dialog" } = props;
	const defaultReferenceId = useId();
	const referenceId = ((_elements$domReferenc = elements.domReference) == null ? void 0 : _elements$domReferenc.id) || defaultReferenceId;
	const floatingId = import_react.useMemo(() => {
		var _getFloatingFocusElem;
		return ((_getFloatingFocusElem = getFloatingFocusElement(elements.floating)) == null ? void 0 : _getFloatingFocusElem.id) || defaultFloatingId;
	}, [elements.floating, defaultFloatingId]);
	const ariaRole = (_componentRoleToAriaR = componentRoleToAriaRoleMap.get(role)) != null ? _componentRoleToAriaR : role;
	const isNested = useFloatingParentNodeId() != null;
	const reference = import_react.useMemo(() => {
		if (ariaRole === "tooltip" || role === "label") return { ["aria-" + (role === "label" ? "labelledby" : "describedby")]: open ? floatingId : void 0 };
		return {
			"aria-expanded": open ? "true" : "false",
			"aria-haspopup": ariaRole === "alertdialog" ? "dialog" : ariaRole,
			"aria-controls": open ? floatingId : void 0,
			...ariaRole === "listbox" && { role: "combobox" },
			...ariaRole === "menu" && { id: referenceId },
			...ariaRole === "menu" && isNested && { role: "menuitem" },
			...role === "select" && { "aria-autocomplete": "none" },
			...role === "combobox" && { "aria-autocomplete": "list" }
		};
	}, [
		ariaRole,
		floatingId,
		isNested,
		open,
		referenceId,
		role
	]);
	const floating = import_react.useMemo(() => {
		const floatingProps = {
			id: floatingId,
			...ariaRole && { role: ariaRole }
		};
		if (ariaRole === "tooltip" || role === "label") return floatingProps;
		return {
			...floatingProps,
			...ariaRole === "menu" && { "aria-labelledby": referenceId }
		};
	}, [
		ariaRole,
		floatingId,
		referenceId,
		role
	]);
	const item = import_react.useCallback((_ref) => {
		let { active, selected } = _ref;
		const commonProps = {
			role: "option",
			...active && { id: floatingId + "-fui-option" }
		};
		switch (role) {
			case "select":
			case "combobox": return {
				...commonProps,
				"aria-selected": selected
			};
		}
		return {};
	}, [floatingId, role]);
	return import_react.useMemo(() => enabled ? {
		reference,
		floating,
		item
	} : {}, [
		enabled,
		reference,
		floating,
		item
	]);
}
var camelCaseToKebabCase = (str) => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase());
function execWithArgsOrReturn(valueOrFn, args) {
	return typeof valueOrFn === "function" ? valueOrFn(args) : valueOrFn;
}
function useDelayUnmount(open, durationMs) {
	const [isMounted, setIsMounted] = import_react.useState(open);
	if (open && !isMounted) setIsMounted(true);
	import_react.useEffect(() => {
		if (!open && isMounted) {
			const timeout = setTimeout(() => setIsMounted(false), durationMs);
			return () => clearTimeout(timeout);
		}
	}, [
		open,
		isMounted,
		durationMs
	]);
	return isMounted;
}
/**
* Provides a status string to apply CSS transitions to a floating element,
* correctly handling placement-aware transitions.
* @see https://floating-ui.com/docs/useTransition#usetransitionstatus
*/
function useTransitionStatus(context, props) {
	if (props === void 0) props = {};
	const { open, elements: { floating } } = context;
	const { duration = 250 } = props;
	const closeDuration = (typeof duration === "number" ? duration : duration.close) || 0;
	const [status, setStatus] = import_react.useState("unmounted");
	const isMounted = useDelayUnmount(open, closeDuration);
	if (!isMounted && status === "close") setStatus("unmounted");
	index$1(() => {
		if (!floating) return;
		if (open) {
			setStatus("initial");
			const frame = requestAnimationFrame(() => {
				import_react_dom.flushSync(() => {
					setStatus("open");
				});
			});
			return () => {
				cancelAnimationFrame(frame);
			};
		}
		setStatus("close");
	}, [open, floating]);
	return {
		isMounted,
		status
	};
}
/**
* Provides styles to apply CSS transitions to a floating element, correctly
* handling placement-aware transitions. Wrapper around `useTransitionStatus`.
* @see https://floating-ui.com/docs/useTransition#usetransitionstyles
*/
function useTransitionStyles(context, props) {
	if (props === void 0) props = {};
	const { initial: unstable_initial = { opacity: 0 }, open: unstable_open, close: unstable_close, common: unstable_common, duration = 250 } = props;
	const placement = context.placement;
	const side = placement.split("-")[0];
	const fnArgs = import_react.useMemo(() => ({
		side,
		placement
	}), [side, placement]);
	const isNumberDuration = typeof duration === "number";
	const openDuration = (isNumberDuration ? duration : duration.open) || 0;
	const closeDuration = (isNumberDuration ? duration : duration.close) || 0;
	const [styles, setStyles] = import_react.useState(() => ({
		...execWithArgsOrReturn(unstable_common, fnArgs),
		...execWithArgsOrReturn(unstable_initial, fnArgs)
	}));
	const { isMounted, status } = useTransitionStatus(context, { duration });
	const initialRef = useLatestRef$1(unstable_initial);
	const openRef = useLatestRef$1(unstable_open);
	const closeRef = useLatestRef$1(unstable_close);
	const commonRef = useLatestRef$1(unstable_common);
	index$1(() => {
		const initialStyles = execWithArgsOrReturn(initialRef.current, fnArgs);
		const closeStyles = execWithArgsOrReturn(closeRef.current, fnArgs);
		const commonStyles = execWithArgsOrReturn(commonRef.current, fnArgs);
		const openStyles = execWithArgsOrReturn(openRef.current, fnArgs) || Object.keys(initialStyles).reduce((acc, key) => {
			acc[key] = "";
			return acc;
		}, {});
		if (status === "initial") setStyles((styles) => ({
			transitionProperty: styles.transitionProperty,
			...commonStyles,
			...initialStyles
		}));
		if (status === "open") setStyles({
			transitionProperty: Object.keys(openStyles).map(camelCaseToKebabCase).join(","),
			transitionDuration: openDuration + "ms",
			...commonStyles,
			...openStyles
		});
		if (status === "close") {
			const styles = closeStyles || initialStyles;
			setStyles({
				transitionProperty: Object.keys(styles).map(camelCaseToKebabCase).join(","),
				transitionDuration: closeDuration + "ms",
				...commonStyles,
				...styles
			});
		}
	}, [
		closeDuration,
		closeRef,
		initialRef,
		openRef,
		commonRef,
		openDuration,
		status,
		fnArgs
	]);
	return {
		isMounted,
		styles
	};
}
/**
* Provides a matching callback that can be used to focus an item as the user
* types, often used in tandem with `useListNavigation()`.
* @see https://floating-ui.com/docs/useTypeahead
*/
function useTypeahead(context, props) {
	var _ref;
	const { open, dataRef } = context;
	const { listRef, activeIndex, onMatch: unstable_onMatch, onTypingChange: unstable_onTypingChange, enabled = true, findMatch = null, resetMs = 750, ignoreKeys = [], selectedIndex = null } = props;
	const timeoutIdRef = import_react.useRef(-1);
	const stringRef = import_react.useRef("");
	const prevIndexRef = import_react.useRef((_ref = selectedIndex != null ? selectedIndex : activeIndex) != null ? _ref : -1);
	const matchIndexRef = import_react.useRef(null);
	const onMatch = useEffectEvent(unstable_onMatch);
	const onTypingChange = useEffectEvent(unstable_onTypingChange);
	const findMatchRef = useLatestRef$1(findMatch);
	const ignoreKeysRef = useLatestRef$1(ignoreKeys);
	index$1(() => {
		if (open) {
			clearTimeoutIfSet(timeoutIdRef);
			matchIndexRef.current = null;
			stringRef.current = "";
		}
	}, [open]);
	index$1(() => {
		if (open && stringRef.current === "") {
			var _ref2;
			prevIndexRef.current = (_ref2 = selectedIndex != null ? selectedIndex : activeIndex) != null ? _ref2 : -1;
		}
	}, [
		open,
		selectedIndex,
		activeIndex
	]);
	const setTypingChange = useEffectEvent((value) => {
		if (value) {
			if (!dataRef.current.typing) {
				dataRef.current.typing = value;
				onTypingChange(value);
			}
		} else if (dataRef.current.typing) {
			dataRef.current.typing = value;
			onTypingChange(value);
		}
	});
	const onKeyDown = useEffectEvent((event) => {
		function getMatchingIndex(list, orderedList, string) {
			const str = findMatchRef.current ? findMatchRef.current(orderedList, string) : orderedList.find((text) => (text == null ? void 0 : text.toLocaleLowerCase().indexOf(string.toLocaleLowerCase())) === 0);
			return str ? list.indexOf(str) : -1;
		}
		const listContent = listRef.current;
		if (stringRef.current.length > 0 && stringRef.current[0] !== " ") {
			if (getMatchingIndex(listContent, listContent, stringRef.current) === -1) setTypingChange(false);
			else if (event.key === " ") stopEvent(event);
		}
		if (listContent == null || ignoreKeysRef.current.includes(event.key) || event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
		if (open && event.key !== " ") {
			stopEvent(event);
			setTypingChange(true);
		}
		if (listContent.every((text) => {
			var _text$, _text$2;
			return text ? ((_text$ = text[0]) == null ? void 0 : _text$.toLocaleLowerCase()) !== ((_text$2 = text[1]) == null ? void 0 : _text$2.toLocaleLowerCase()) : true;
		}) && stringRef.current === event.key) {
			stringRef.current = "";
			prevIndexRef.current = matchIndexRef.current;
		}
		stringRef.current += event.key;
		clearTimeoutIfSet(timeoutIdRef);
		timeoutIdRef.current = window.setTimeout(() => {
			stringRef.current = "";
			prevIndexRef.current = matchIndexRef.current;
			setTypingChange(false);
		}, resetMs);
		const prevIndex = prevIndexRef.current;
		const index = getMatchingIndex(listContent, [...listContent.slice((prevIndex || 0) + 1), ...listContent.slice(0, (prevIndex || 0) + 1)], stringRef.current);
		if (index !== -1) {
			onMatch(index);
			matchIndexRef.current = index;
		} else if (event.key !== " ") {
			stringRef.current = "";
			setTypingChange(false);
		}
	});
	const reference = import_react.useMemo(() => ({ onKeyDown }), [onKeyDown]);
	const floating = import_react.useMemo(() => {
		return {
			onKeyDown,
			onKeyUp(event) {
				if (event.key === " ") setTypingChange(false);
			}
		};
	}, [onKeyDown, setTypingChange]);
	return import_react.useMemo(() => enabled ? {
		reference,
		floating
	} : {}, [
		enabled,
		reference,
		floating
	]);
}
function getArgsWithCustomFloatingHeight(state, height) {
	return {
		...state,
		rects: {
			...state.rects,
			floating: {
				...state.rects.floating,
				height
			}
		}
	};
}
/**
* Positions the floating element such that an inner element inside of it is
* anchored to the reference element.
* @see https://floating-ui.com/docs/inner
* @deprecated
*/
var inner = (props) => ({
	name: "inner",
	options: props,
	async fn(state) {
		const { listRef, overflowRef, onFallbackChange, offset: innerOffset = 0, index = 0, minItemsVisible = 4, referenceOverflowThreshold = 0, scrollRef, ...detectOverflowOptions } = evaluate(props, state);
		const { rects, platform, elements: { floating } } = state;
		const item = listRef.current[index];
		const scrollEl = (scrollRef == null ? void 0 : scrollRef.current) || floating;
		const clientTop = floating.clientTop || scrollEl.clientTop;
		const floatingIsBordered = floating.clientTop !== 0;
		const scrollElIsBordered = scrollEl.clientTop !== 0;
		const floatingIsScrollEl = floating === scrollEl;
		if (!state.placement.startsWith("bottom")) warn("`placement` side must be \"bottom\" when using the `inner`", "middleware.");
		if (!item) return {};
		const nextArgs = {
			...state,
			...await offset(-item.offsetTop - floating.clientTop - rects.reference.height / 2 - item.offsetHeight / 2 - innerOffset).fn(state)
		};
		const overflow = await platform.detectOverflow(getArgsWithCustomFloatingHeight(nextArgs, scrollEl.scrollHeight + clientTop + floating.clientTop), detectOverflowOptions);
		const refOverflow = await platform.detectOverflow(nextArgs, {
			...detectOverflowOptions,
			elementContext: "reference"
		});
		const diffY = max(0, overflow.top);
		const nextY = nextArgs.y + diffY;
		const maxHeight = (scrollEl.scrollHeight > scrollEl.clientHeight ? (v) => v : round)(max(0, scrollEl.scrollHeight + (floatingIsBordered && floatingIsScrollEl || scrollElIsBordered ? clientTop * 2 : 0) - diffY - max(0, overflow.bottom)));
		scrollEl.style.maxHeight = maxHeight + "px";
		scrollEl.scrollTop = diffY;
		if (onFallbackChange) {
			const shouldFallback = scrollEl.offsetHeight < item.offsetHeight * min(minItemsVisible, listRef.current.length) - 1 || refOverflow.top >= -referenceOverflowThreshold || refOverflow.bottom >= -referenceOverflowThreshold;
			import_react_dom.flushSync(() => onFallbackChange(shouldFallback));
		}
		if (overflowRef) overflowRef.current = await platform.detectOverflow(getArgsWithCustomFloatingHeight({
			...nextArgs,
			y: nextY
		}, scrollEl.offsetHeight + clientTop + floating.clientTop), detectOverflowOptions);
		return { y: nextY };
	}
});
/**
* Changes the `inner` middleware's `offset` upon a `wheel` event to
* expand the floating element's height, revealing more list items.
* @see https://floating-ui.com/docs/inner
* @deprecated
*/
function useInnerOffset(context, props) {
	const { open, elements } = context;
	const { enabled = true, overflowRef, scrollRef, onChange: unstable_onChange } = props;
	const onChange = useEffectEvent(unstable_onChange);
	const controlledScrollingRef = import_react.useRef(false);
	const prevScrollTopRef = import_react.useRef(null);
	const initialOverflowRef = import_react.useRef(null);
	import_react.useEffect(() => {
		if (!enabled) return;
		function onWheel(e) {
			if (e.ctrlKey || !el || overflowRef.current == null) return;
			const dY = e.deltaY;
			const isAtTop = overflowRef.current.top >= -.5;
			const isAtBottom = overflowRef.current.bottom >= -.5;
			const remainingScroll = el.scrollHeight - el.clientHeight;
			const sign = dY < 0 ? -1 : 1;
			const method = dY < 0 ? "max" : "min";
			if (el.scrollHeight <= el.clientHeight) return;
			if (!isAtTop && dY > 0 || !isAtBottom && dY < 0) {
				e.preventDefault();
				import_react_dom.flushSync(() => {
					onChange((d) => d + Math[method](dY, remainingScroll * sign));
				});
			} else if (/firefox/i.test(getUserAgent())) el.scrollTop += dY;
		}
		const el = (scrollRef == null ? void 0 : scrollRef.current) || elements.floating;
		if (open && el) {
			el.addEventListener("wheel", onWheel);
			requestAnimationFrame(() => {
				prevScrollTopRef.current = el.scrollTop;
				if (overflowRef.current != null) initialOverflowRef.current = { ...overflowRef.current };
			});
			return () => {
				prevScrollTopRef.current = null;
				initialOverflowRef.current = null;
				el.removeEventListener("wheel", onWheel);
			};
		}
	}, [
		enabled,
		open,
		elements.floating,
		overflowRef,
		scrollRef,
		onChange
	]);
	const floating = import_react.useMemo(() => ({
		onKeyDown() {
			controlledScrollingRef.current = true;
		},
		onWheel() {
			controlledScrollingRef.current = false;
		},
		onPointerMove() {
			controlledScrollingRef.current = false;
		},
		onScroll() {
			const el = (scrollRef == null ? void 0 : scrollRef.current) || elements.floating;
			if (!overflowRef.current || !el || !controlledScrollingRef.current) return;
			if (prevScrollTopRef.current !== null) {
				const scrollDiff = el.scrollTop - prevScrollTopRef.current;
				if (overflowRef.current.bottom < -.5 && scrollDiff < -1 || overflowRef.current.top < -.5 && scrollDiff > 1) import_react_dom.flushSync(() => onChange((d) => d + scrollDiff));
			}
			requestAnimationFrame(() => {
				prevScrollTopRef.current = el.scrollTop;
			});
		}
	}), [
		elements.floating,
		onChange,
		overflowRef,
		scrollRef
	]);
	return import_react.useMemo(() => enabled ? { floating } : {}, [enabled, floating]);
}
function getNodeChildren(nodes, id, onlyOpenChildren) {
	if (onlyOpenChildren === void 0) onlyOpenChildren = true;
	return nodes.filter((node) => {
		var _node$context;
		return node.parentId === id && (!onlyOpenChildren || ((_node$context = node.context) == null ? void 0 : _node$context.open));
	}).flatMap((child) => [child, ...getNodeChildren(nodes, child.id, onlyOpenChildren)]);
}
function isPointInPolygon(point, polygon) {
	const [x, y] = point;
	let isInside = false;
	const length = polygon.length;
	for (let i = 0, j = length - 1; i < length; j = i++) {
		const [xi, yi] = polygon[i] || [0, 0];
		const [xj, yj] = polygon[j] || [0, 0];
		if (yi >= y !== yj >= y && x <= (xj - xi) * (y - yi) / (yj - yi) + xi) isInside = !isInside;
	}
	return isInside;
}
function isInside(point, rect) {
	return point[0] >= rect.x && point[0] <= rect.x + rect.width && point[1] >= rect.y && point[1] <= rect.y + rect.height;
}
/**
* Generates a safe polygon area that the user can traverse without closing the
* floating element once leaving the reference element.
* @see https://floating-ui.com/docs/useHover#safepolygon
*/
function safePolygon(options) {
	if (options === void 0) options = {};
	const { buffer = .5, blockPointerEvents = false, requireIntent = true } = options;
	const timeoutRef = { current: -1 };
	let hasLanded = false;
	let lastX = null;
	let lastY = null;
	let lastCursorTime = typeof performance !== "undefined" ? performance.now() : 0;
	function getCursorSpeed(x, y) {
		const currentTime = performance.now();
		const elapsedTime = currentTime - lastCursorTime;
		if (lastX === null || lastY === null || elapsedTime === 0) {
			lastX = x;
			lastY = y;
			lastCursorTime = currentTime;
			return null;
		}
		const deltaX = x - lastX;
		const deltaY = y - lastY;
		const speed = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / elapsedTime;
		lastX = x;
		lastY = y;
		lastCursorTime = currentTime;
		return speed;
	}
	const fn = (_ref) => {
		let { x, y, placement, elements, onClose, nodeId, tree } = _ref;
		return function onMouseMove(event) {
			function close() {
				clearTimeoutIfSet(timeoutRef);
				onClose();
			}
			clearTimeoutIfSet(timeoutRef);
			if (!elements.domReference || !elements.floating || placement == null || x == null || y == null) return;
			const { clientX, clientY } = event;
			const clientPoint = [clientX, clientY];
			const target = getTarget(event);
			const isLeave = event.type === "mouseleave";
			const isOverFloatingEl = contains(elements.floating, target);
			const isOverReferenceEl = contains(elements.domReference, target);
			const refRect = elements.domReference.getBoundingClientRect();
			const rect = elements.floating.getBoundingClientRect();
			const side = placement.split("-")[0];
			const cursorLeaveFromRight = x > rect.right - rect.width / 2;
			const cursorLeaveFromBottom = y > rect.bottom - rect.height / 2;
			const isOverReferenceRect = isInside(clientPoint, refRect);
			const isFloatingWider = rect.width > refRect.width;
			const isFloatingTaller = rect.height > refRect.height;
			const left = (isFloatingWider ? refRect : rect).left;
			const right = (isFloatingWider ? refRect : rect).right;
			const top = (isFloatingTaller ? refRect : rect).top;
			const bottom = (isFloatingTaller ? refRect : rect).bottom;
			if (isOverFloatingEl) {
				hasLanded = true;
				if (!isLeave) return;
			}
			if (isOverReferenceEl) hasLanded = false;
			if (isOverReferenceEl && !isLeave) {
				hasLanded = true;
				return;
			}
			if (isLeave && isElement(event.relatedTarget) && contains(elements.floating, event.relatedTarget)) return;
			if (tree && getNodeChildren(tree.nodesRef.current, nodeId).length) return;
			if (side === "top" && y >= refRect.bottom - 1 || side === "bottom" && y <= refRect.top + 1 || side === "left" && x >= refRect.right - 1 || side === "right" && x <= refRect.left + 1) return close();
			let rectPoly = [];
			switch (side) {
				case "top":
					rectPoly = [
						[left, refRect.top + 1],
						[left, rect.bottom - 1],
						[right, rect.bottom - 1],
						[right, refRect.top + 1]
					];
					break;
				case "bottom":
					rectPoly = [
						[left, rect.top + 1],
						[left, refRect.bottom - 1],
						[right, refRect.bottom - 1],
						[right, rect.top + 1]
					];
					break;
				case "left":
					rectPoly = [
						[rect.right - 1, bottom],
						[rect.right - 1, top],
						[refRect.left + 1, top],
						[refRect.left + 1, bottom]
					];
					break;
				case "right":
					rectPoly = [
						[refRect.right - 1, bottom],
						[refRect.right - 1, top],
						[rect.left + 1, top],
						[rect.left + 1, bottom]
					];
					break;
			}
			function getPolygon(_ref2) {
				let [x, y] = _ref2;
				switch (side) {
					case "top": return [
						[isFloatingWider ? x + buffer / 2 : cursorLeaveFromRight ? x + buffer * 4 : x - buffer * 4, y + buffer + 1],
						[isFloatingWider ? x - buffer / 2 : cursorLeaveFromRight ? x + buffer * 4 : x - buffer * 4, y + buffer + 1],
						...[[rect.left, cursorLeaveFromRight ? rect.bottom - buffer : isFloatingWider ? rect.bottom - buffer : rect.top], [rect.right, cursorLeaveFromRight ? isFloatingWider ? rect.bottom - buffer : rect.top : rect.bottom - buffer]]
					];
					case "bottom": return [
						[isFloatingWider ? x + buffer / 2 : cursorLeaveFromRight ? x + buffer * 4 : x - buffer * 4, y - buffer],
						[isFloatingWider ? x - buffer / 2 : cursorLeaveFromRight ? x + buffer * 4 : x - buffer * 4, y - buffer],
						...[[rect.left, cursorLeaveFromRight ? rect.top + buffer : isFloatingWider ? rect.top + buffer : rect.bottom], [rect.right, cursorLeaveFromRight ? isFloatingWider ? rect.top + buffer : rect.bottom : rect.top + buffer]]
					];
					case "left": {
						const cursorPointOne = [x + buffer + 1, isFloatingTaller ? y + buffer / 2 : cursorLeaveFromBottom ? y + buffer * 4 : y - buffer * 4];
						const cursorPointTwo = [x + buffer + 1, isFloatingTaller ? y - buffer / 2 : cursorLeaveFromBottom ? y + buffer * 4 : y - buffer * 4];
						return [
							...[[cursorLeaveFromBottom ? rect.right - buffer : isFloatingTaller ? rect.right - buffer : rect.left, rect.top], [cursorLeaveFromBottom ? isFloatingTaller ? rect.right - buffer : rect.left : rect.right - buffer, rect.bottom]],
							cursorPointOne,
							cursorPointTwo
						];
					}
					case "right": return [
						[x - buffer, isFloatingTaller ? y + buffer / 2 : cursorLeaveFromBottom ? y + buffer * 4 : y - buffer * 4],
						[x - buffer, isFloatingTaller ? y - buffer / 2 : cursorLeaveFromBottom ? y + buffer * 4 : y - buffer * 4],
						...[[cursorLeaveFromBottom ? rect.left + buffer : isFloatingTaller ? rect.left + buffer : rect.right, rect.top], [cursorLeaveFromBottom ? isFloatingTaller ? rect.left + buffer : rect.right : rect.left + buffer, rect.bottom]]
					];
				}
			}
			if (isPointInPolygon([clientX, clientY], rectPoly)) return;
			if (hasLanded && !isOverReferenceRect) return close();
			if (!isLeave && requireIntent) {
				const cursorSpeed = getCursorSpeed(event.clientX, event.clientY);
				if (cursorSpeed !== null && cursorSpeed < .1) return close();
			}
			if (!isPointInPolygon([clientX, clientY], getPolygon([x, y]))) close();
			else if (!hasLanded && requireIntent) timeoutRef.current = window.setTimeout(close, 40);
		};
	};
	fn.__options = { blockPointerEvents };
	return fn;
}

//#endregion
export { Composite, CompositeItem, FloatingArrow, FloatingDelayGroup, FloatingFocusManager, FloatingList, FloatingNode, FloatingOverlay, FloatingPortal, FloatingTree, NextFloatingDelayGroup, arrow, autoPlacement, autoUpdate, computePosition, detectOverflow, flip, getOverflowAncestors, hide, inline, inner, limitShift, offset, platform, safePolygon, shift, size, useClick, useClientPoint, useDelayGroup, useDelayGroupContext, useDismiss, useFloating, useFloatingNodeId, useFloatingParentNodeId, useFloatingPortalNode, useFloatingRootContext, useFloatingTree, useFocus, useHover, useId, useInnerOffset, useInteractions, useListItem, useListNavigation, useMergeRefs, useNextDelayGroup, useRole, useTransitionStatus, useTransitionStyles, useTypeahead };
//# sourceMappingURL=@floating-ui_react.js.map