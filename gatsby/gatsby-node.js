import path from "path";
import fetch from "isomorphic-fetch";

async function turnPizzasIntoPages({ graphql, actions }) {
  // 1. Get a template for this pages
  const pizzaTemplate = path.resolve("./src/templates/Pizza.js");

  // 2. Query all pizzas
  const { data } = await graphql(`
    query {
      pizzas: allSanityPizza {
        nodes {
          name
          slug {
            current
          }
        }
      }
    }
  `);

  // 3. Loop over each pizza and create a page for that pizza
  data.pizzas.nodes.forEach((pizza) => {
    actions.createPage({
      // What is the url for this new page?
      path: `pizza/${pizza.slug.current}`,
      component: pizzaTemplate,
      context: {
        slug: pizza.slug.current,
      },
    });
  });
}

async function turnToppingsIntoPages({ graphql, actions }) {
  // 1. get the template
  const toppingsTemplate = path.resolve("./src/pages/pizzas.js");

  // 2. query all the toppings
  const { data } = await graphql(`
    query {
      toppings: allSanityTopping {
        nodes {
          name
          id
        }
      }
    }
  `);

  // 3. createPage for that toppings
  data.toppings.nodes.forEach((topping) => {
    actions.createPage({
      // 4. pass topping data to pizza.js
      path: `topping/${topping.name}`,
      component: toppingsTemplate,
      context: {
        topping: topping.name,
      },
    });
  });
}

async function fetchBeersAndTurnIntoNodes({
  actions,
  createNodeId,
  createContentDigest,
}) {
  // 1. Fetch a list of beers
  const res = await fetch("https://sampleapis.com/beers/api/ale");
  const beers = await res.json();

  // 2. Loop over each one
  beers.forEach((beer) => {
    const nodeMeta = {
      id: createNodeId(`beer-${beer.name}`),
      parent: null,
      children: [],
      internal: {
        type: "Beer",
        mediaType: "application/json",
        contentDigest: createContentDigest(beer),
      },
    };
    actions.createNode({
      ...beer,
      ...nodeMeta,
    });
  });
  // 3. Create a node for each one
}

async function turnSlicemastersIntoPages({ graphql, actions }) {
  // 1. Query all slicemasters
  const { data } = await graphql(`
    query {
      slicemasters: allSanityPerson {
        totalCount
        nodes {
          name
          id
          slug {
            current
          }
        }
      }
    }
  `);

  // 2. Turn each slicemaster into their own page
  data.slicemasters.nodes.forEach((slicemaster) => {
    actions.createPage({
      path: `slicemaster/${slicemaster.slug.current}`,
      component: path.resolve("./src/templates/Slicemaster.js"),
      context: {
        slug: slicemaster.slug.current,
      },
    });
  });

  // 3. Figure out numpages based on numslicemasters and numperpage
  const pageSize = parseInt(process.env.GATSBY_PAGE_SIZE);
  const pageCount = Math.ceil(data.slicemasters.totalCount / pageSize);
  // 4. Loop over pages and create them
  Array.from({ length: pageCount }).forEach((_, i) => {
    actions.createPage({
      path: `/slicemasters/${i + 1}`,
      component: path.resolve("./src/pages/slicemasters.js"),
      // Data passed to context when we need it
      context: {
        skip: i * pageSize,
        currentPage: i + 1,
        pageSize,
      },
    });
  });
}

export async function sourceNodes(params) {
  // fetch a list of beers and source them into our gatsby API
  await Promise.all([fetchBeersAndTurnIntoNodes(params)]);
}

export async function createPages(params) {
  // Create pages dynamically
  // Wait for all promises to be resolved before finishing this function
  await Promise.all([
    // 1. Pizzas
    turnPizzasIntoPages(params),
    // 2. Toppings
    turnToppingsIntoPages(params),
    // 3. Slicemasters
    turnSlicemastersIntoPages(params),
  ]);
}
