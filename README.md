# Ant bridge simulator
Simulating how ants build bridges

Live demo: https://codepen.io/davepvm/full/PQxWRo

## Inspiration

I read this article: https://www.quantamagazine.org/the-simple-algorithm-that-ants-use-to-build-bridges-20180226/

It seems like ants make bridges because of two rules they follow:
1. When ants reach an edge, they slow down
2. When an ant gets stepped on, it freezes

So, when an ant is walking and reaches an end, it slows down, but the one behind it keeps going and steps on it. The lower ant freezes and a bridge starts to form. If a bridge has too many ants on it and there aren't ants to walk over it any more, the ants in the bridge start unfreezing and the bridge breaks apart. This is how ant bridges end up balancing path efficiency and ant use efficiency.

## Work to do
- Do more sophisticated navigation (pheromone trails?) so that bridges don't appear in dumb places from random walking
