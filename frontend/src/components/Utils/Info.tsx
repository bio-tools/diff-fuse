export function Info() {
    return (
        <div>
            <h2>What Diff Fuse does</h2>
            <p>
                Diff Fuse compares multiple JSON documents side by side and helps you build one merged result by
                choosing which values should be kept in the final output.
            </p>

            <h2>How to use it</h2>

            <h3>1. Add your JSON documents</h3>
            <p>
                Paste or type one or more valid JSON documents in the <strong>Raw JSONs</strong> input area. Give them
                clear names so it is easier to see which document each value comes from.
            </p>

            <h3>2. Add documents to session</h3>
            <p>
                Once the documents are loaded, <strong>Diff Fuse</strong> panel computes a structural comparison and
                shows the result as a tree.
            </p>

            <h3>3. Choose what you want to see</h3>
            <p>
                The <strong>filter</strong> menu decides which rows the tree shows:
            </p>
            <ul>
                <li>
                    <strong>Show everything</strong>: the full tree, including paths where all documents agree
                </li>
                <li>
                    <strong>All differences</strong>: only paths that are not the same (default)
                </li>
                <li>
                    <strong>Only diff</strong>, <strong>Only diff: missing</strong>,{" "}
                    <strong>Only diff: incompatible</strong>: narrow down to one kind of difference, which helps when
                    you want to work through them a category at a time
                </li>
            </ul>
            <p>
                A second menu filters by <strong>resolution</strong> instead: <strong>Any state</strong>,{" "}
                <strong>Resolved</strong>, or <strong>Needs a decision</strong>. The two menus are independent and apply
                together, so you can narrow to one kind of difference that still needs your attention.
            </p>
            <p>
                Filtering keeps the parents of a matching row visible, so you can always see where a row sits even when
                its parents do not match the filter themselves. If nothing matches, the panel says so.
            </p>
            <p>
                Next to it, the <strong>expand/collapse</strong> button opens or closes every row at once. Its icon
                shows what the next press will do. You can still open and close individual rows with the arrow on the
                left of each one.
            </p>

            <h3>4. Read the comparison tree</h3>
            <p>Each row represents one JSON path. For each row, Diff Fuse can show:</p>
            <ul>
                <li>the path name</li>
                <li>the values from each document</li>
                <li>the current merged value</li>
                <li>a label describing the difference, when the documents do not agree</li>
                <li>a checkmark once the row is settled</li>
            </ul>
            <p>
                The checkmark tells you how far along a row is. A <strong>green circled check</strong> means you chose
                the value, either on that row or on a parent it inherits from. A <strong>faint plain check</strong>
                means Diff Fuse settled it on its own, because only one real value existed. <strong>No check</strong>{" "}
                means the row still needs a decision and is left out of the merged result until you make one. A parent
                only gets a check once everything beneath it has one.
            </p>
            <p>
                Paths where all documents agree show no label, because there is nothing to resolve there. Every label
                you do see starts with <strong>diff</strong>, because they are all kinds of difference — the part after
                the colon says which kind.
            </p>

            <h3>5. Resolve differences</h3>
            <p>
                When documents differ, select the value you want to keep from one of the source documents. The merged
                result updates immediately.
            </p>
            <p>
                Selections also <strong>propagate down the tree</strong>. That means choosing a value at a higher-level
                node affects its children as well, unless you override a child node more specifically.
            </p>

            <h3>6. Adjust array matching when needed</h3>
            <p>
                Arrays can be compared in different ways. Use the array strategy control on array nodes to choose how
                elements should be aligned across documents.
            </p>
            <ul>
                <li>
                    <strong>index</strong>: align items by position, so element 0 is compared with element 0, element 1
                    with element 1, and so on
                </li>
                <li>
                    <strong>keyed</strong>: align object items using a field such as <code>id</code> or{" "}
                    <code>name</code>
                </li>
                <li>
                    <strong>value</strong>: align scalar array entries by their value
                </li>
            </ul>
            <p>
                Use <strong>keyed</strong> when array items are objects that may appear in different orders. Use{" "}
                <strong>value</strong> when the array contains scalars such as strings or numbers and order is less
                important than content.
            </p>

            <h3>7. Check the diagnostics</h3>
            <p>
                The <strong>diagnostics</strong> button summarises the comparison: how many rows fall into each kind of
                difference, and the exact reason behind every <strong>diff: incompatible</strong> row, such as{" "}
                <code>type mismatch at 'license': null vs string</code>. It is the quickest way to find which rows still
                need a decision.
            </p>

            <h3>8. Preview and export</h3>
            <p>You can then:</p>
            <ul>
                <li>
                    <strong>Preview</strong> the merged JSON in a popup
                </li>
                <li>
                    <strong>Copy</strong> the merged JSON to the clipboard
                </li>
                <li>
                    <strong>Download</strong> the merged JSON as a file
                </li>
            </ul>
            <p>
                If some rows are still unresolved, the preview says so — those paths are left out of the merged result
                until you pick a value for them.
            </p>

            <h2>Kinds of difference</h2>
            <p>
                All three labels mark a difference. What separates them is <em>why</em> the documents differ, and
                whether Diff Fuse can settle it without you.
            </p>
            <ul>
                <li>
                    <strong>diff</strong>: the documents hold different values of the same type, for example{" "}
                    <code>"MIT"</code> against <code>"Apache-2.0"</code>. Only you can say which one is right, so pick a
                    document.
                </li>
                <li>
                    <strong>diff: missing</strong>: only some documents have a value here — the rest either omit the
                    field or set it to <code>null</code>. There is just one real value, so it is chosen automatically.
                    You can still override it.
                </li>
                <li>
                    <strong>diff: incompatible</strong>: the documents disagree on shape, for example an object against
                    a string. There is no sensible way to compare them piece by piece, so the whole value is offered
                    from each document and you pick one.
                </li>
                <li>
                    <strong>no label</strong>: every document agrees, so there is nothing to resolve.
                </li>
            </ul>
            <p>
                A parent row is labelled <strong>diff: incompatible</strong> whenever something nested inside it is.
                Resolve the row that actually carries the conflict and the parent clears too — the Diagnostics panel
                lists exactly which rows those are.
            </p>

            <h2>Recommended workflow</h2>
            <ul>
                <li>
                    Stay on <strong>All differences</strong> to focus on paths that need decisions
                </li>
                <li>Resolve higher-level differences first when possible</li>
                <li>Adjust array matching if array rows look misaligned</li>
                <li>
                    Filter to <strong>Only diff: incompatible</strong> to clear the rows that block the merge, then work
                    through the rest
                </li>
                <li>
                    Switch to <strong>Needs a decision</strong> to see only what is left; when it comes up empty, every
                    row is settled
                </li>
                <li>Preview the merged JSON before copying or downloading it</li>
            </ul>
        </div>
    );
}
