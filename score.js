import "babel-polyfill";
var jsdom = require("jsdom");


// Wrap a DOM element to provide a handier API for scoring and tagging.
// If we end up not doing our work directly to the DOM tree in the future, this
// saves us rewriting all our transformers.
// function node(element) {
//     return {
//         __proto__: element,
//         rate
// }


// Tag a DOM tree or subtree with scores.
// Maybe this will become the map portion of a map-reduce analog.
function score(tree, rules) {
    var anyMatched;

    do {
        anyMatched = false;
        for (let [pattern, transform] of rules) {
            var matches = tree.querySelectorAll(pattern);
            for (let element of matches) {
                anyMatched = true;
                // Transform element according to RHS of rule:
                transform(node(element));
            }
        }
    } while (anyMatched);
}


function main() {
    var doc = jsdom.jsdom(
        '<p><a class="ad" href="https://github.com/tmpvar/jsdom">jsdom!</a></p>'
    );
    score(doc, rules);
}


main();


// Use a DOM selector to find nodes to match this rule, from the original DOM tree. For consistency, Nodes will still be delivered to the transformers, but they'll have empty types and no scores. If the verb returns null, bail out and don't add the node to any indices.
function dom(selector) {
    
}


// Return Nodes of a given type efficiently from an index, in no particular order.
function typed(type) {
    
}


// Add the number returned by the transformer to the score.
// By not doing the addition in the transformer itself, we leave open the possibility of running rules in parallel.
function bonus() {
    
}


// Multiply the number returned by the transformed into the node's score.
function scale() {
    
}


function rule(source, mixer, verb) {
    
}


// NEXT: This set of rules might be the beginning of something that works. (It's modeled after what I do when I try to do this by hand: I look for balls of black text, and I look for them to be near each other, generally siblings: a "cluster" of them.) Order of rules matters (until we find a reason to add more complexity). (We can always help people insert new rules in the desired order by providing a way to insert them before or after such-and-such a named rule.) Perhaps we might as well remove the "mixer" arg from rule() and just do the math in the verbs, since we won't do parallelism at first. And it turned out we didn't use the types much, so maybe we should get rid of those or at least factor them out.
// score on text length -> texty. We start with this because, no matter the other markup details, the main body text is definitely going to have a bunch of text. Every node starts with a score of 1, so we can just multiply all the time.
rule(dom('p,div'), scale, node => ['texty', len(node.mergedStrippedInnerTextNakedOrInInlineTags)] if > 0 else null)  // maybe log or sqrt(char_count) or something. Char count might work even for CJK. mergedInnerTextNakedOrInInInlineTags() doesn't count chars in, say, p (or any other block-level) tags within a div tag.
rule(typed('texty'), scale, node.linkDensity)
// give bonuses for being in p tags. TODO: article tags, too
rule(typed('texty'), scale, node => node.el.tagName == 'p' ? 1.5 : 1)
// give bonuses for being (nth) cousins of other texties  // IOW, texties that are the same-leveled children of a common ancestor get a bonus.
rule(typed('texty'), scale, node => node.numCousinsOfAtLeastOfScore(200) * 1.5)
// Find the texty with the highest score.

// Let rules return multiple knowledgebase entries (even of multiple types), in case we need to label or score a node on 2 orthogonal axes.

// A fancier selector design, with combinators:
rule(and(tag('p'), klass('snork')), scored('texty', node => node.word_count))  // and, tag, and klass are object constructors that the query engine can read. They don't actually do the query themselves. That way, a query planner can be smarter than them, figuring out which indices to use based on all of them. (We'll probably keep a heap by each dimension's score and a hash by type name, for starters.)

// We don't need to know up front what types may be emitted; we can just observe which indices were touched and re-run the rules that take those types in, then the rules that take *those* emitted types in, etc.
// How do we ensure blockquotes, h2s, uls, etc. that are part of the article are included? Maybe what we're really looking for is a single, high-scoring container (or span of a container?) and then taking either everything inside it or everything but certain excised bits (interstitial ads/relateds). There might be 2 phases: rank and yank.
// Also do something about invisible nodes.

Yankers:
max score (on some dimension)
max-scored sibling cluster (maybe a contiguous span of containers around high-scoring ones, like a blur algo allowing occasional flecks of low-scoring noise)

Yanking:
* Block-level containers at the smallest. (Any smaller, and you're pulling out parts of paragraphs, not entire paragraphs.) mergedInnerTextNakedOrInInInlineTags might make this superfluous.