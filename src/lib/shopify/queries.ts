/** Storefront API GraphQL documents. Keep selections in sync with `./types`. */

const PRODUCT_FIELDS = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    availableForSale
    featuredImage {
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: $variantCount) {
      nodes {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
      }
    }
  }
`;

export const shopQuery = /* GraphQL */ `
  query Shop {
    shop {
      name
      description
      primaryDomain {
        url
      }
    }
  }
`;

export const productsQuery = /* GraphQL */ `
  query Products($first: Int!, $variantCount: Int!) {
    products(first: $first, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...ProductFields
      }
    }
  }
  ${PRODUCT_FIELDS}
`;

export const productByHandleQuery = /* GraphQL */ `
  query ProductByHandle($handle: String!, $variantCount: Int!) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
  ${PRODUCT_FIELDS}
`;
