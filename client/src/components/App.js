import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Card, Container, Heading, Icon, Image, SearchField, Spinner, Text } from 'gestalt';

import Loader from './Loader';
import './App.css';

// Strapi SDK
import Strapi from 'strapi-sdk-javascript/build/main';
const apiUrl = process.env.API_URL || 'http://localhost:1337';
const strapi = new Strapi(apiUrl);

const App = () => {

  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingBrands, setLoadingBrands] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await strapi.request('POST', '/graphql', {
          data: {
            query: `query {
              brands {
                _id
                name
                description
                image {
                  url
                }
              }
            }`
          }
        });
        // console.log(response);
        setBrands(response.data.brands)
        setLoadingBrands(false);
      } catch (e) {
        console.log(e);
        setLoadingBrands(true);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    searchBrands();
  }, [searchTerm])

  const handleChange = ({ value }) => {
    setSearchTerm(value);
  };

  // const filteredBrands = ({ searchTerm, brands }) => {
  //   return brands.filter((brand) => {
  //     return brand.name.toLowerCase().includes(searchTerm.toLowerCase()) || brand.description.toLowerCase().includes(searchTerm.toLowerCase());
  //   })
  // };

  const searchBrands = async () => {
    const response = await strapi.request('POST', '/graphql', {
      data: {
        query: `query {
          brands(where: {
            name_contains: "${searchTerm}"
          }) {
            _id
            name
            description
            image {
              url
            }
          }
        }`
      }
    });
    console.log(searchTerm, response.data.brands);
    setBrands(response.data.brands);
    setLoadingBrands(false);
  };

  return (
    <Container>
      {/* Brand Search Fields */}
      <Box display="flex" justifyContent="center" marginTop={4}>
        <SearchField
          id="searchField"
          accessibilityLabel="Brands Search Field"
          onChange={handleChange}
          value={searchTerm}
          placeholder="Search Brands"
        >
        </SearchField>
        <Box margin={2}>
          <Icon
            icon="filter"
            color={searchTerm ? 'orange' : 'gray'}
            size={20}
            accessibilityLabel="Filter"
          />
        </Box>
      </Box>

      {/* Brands Section */}
      <Box
        display="flex"
        justifyContent="center"
        marginBottom={2}
      >
      {/* Brands Section */}
      <Heading color="midnight" size="md">
        Brew Brands
      </Heading>
      </Box>
      {/* Brands */}
      <Box
        dangerouslySetInlineStyle={{
          __style: {
            backgroundColor: '#d6c8ec'
          }
        }}
        shape="rounded"
        wrap
        display="flex"
        justifyContent="around">
        {brands.map((brand) => (
          <Box key={brand._id} margin={2} paddingY={4} width={200}>
            <Card
              image={
                <Box height={200} width={200}>
                  <Image
                    alt="Brand"
                    fit="cover"
                    naturalHeight={1}
                    naturalWidth={1}
                    src={`${apiUrl}${brand.image.url}`}
                  >
                  </Image>
                </Box>
              }
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                direction="column"
              >
                <Text size="xl">{brand.name}</Text>
                <Text>{brand.description}</Text>
                <Text size="xl">
                  <Link to={`/${brand._id}`}>See Brews</Link>
                </Text>
              </Box>
            </Card>
          </Box>
        ))}
      </Box>
      {/* <Spinner show={loadingBrands} accessibilityLabel="Loading Spinner"/> */}
      <Loader show={loadingBrands}/>
    </Container>
  );
}

export default App;
