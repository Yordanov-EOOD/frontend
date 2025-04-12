import React, { useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import useInput from "../../hooks/useInput";
import { displayError } from "../../utils";
import SearchResult from "./SearchResult";

const Wrapper = styled.div`
  margin: 1rem 0;
  margin-left: 1rem;

  input {
    height: 40px;
    width: 70%;
    border-radius: 30px;
    background: ${(props) => props.theme.tertiaryColor2};
    border: ${(props) => props.theme.tertiaryColor2};
    color: ${(props) => props.theme.secondaryColor};
    font-family: ${(props) => props.theme.font};
    font-size: 1rem;
    padding-left: 1.2rem;
  }

  @media screen and (max-width: 530px) {
    input {
      font-size: 0.9rem;
    }
  }
`;

const SearchInput = () => {
  const term = useInput("");
  const [searchTagData, setSearchTagData] = useState(null);
  const [searchTweetData, setSearchTweetData] = useState(null);
  const [searchUserData, setSearchUserData] = useState(null);
  const [searchTagLoading, setSearchTagLoading] = useState(false);
  const [searchTweetLoading, setSearchTweetLoading] = useState(false);
  const [searchUserLoading, setSearchUserLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!term.value) {
      return toast.error("Enter something to search");
    }
    try {
      setSearchTagLoading(true);
      setSearchTweetLoading(true);
      setSearchUserLoading(true);
      const [tagRes, tweetRes, userRes] = await Promise.all([
        fetch(`/api/search/tag?term=${encodeURIComponent(term.value)}`),
        fetch(`/api/search/tweet?term=${encodeURIComponent(term.value)}`),
        fetch(`/api/search/user?term=${encodeURIComponent(term.value)}`)
      ]);
      const tagData = await tagRes.json();
      const tweetData = await tweetRes.json();
      const userData = await userRes.json();
      setSearchTagData(tagData);
      setSearchTweetData(tweetData);
      setSearchUserData(userData);
    } catch (err) {
      displayError(err);
    }
    setSearchTagLoading(false);
    setSearchTweetLoading(false);
    setSearchUserLoading(false);
    term.setValue("");
  };

  return (
    <>
      <Wrapper>
        <form onSubmit={handleSearch}>
          <input
            placeholder="Search by tags, tweets, people"
            type="text"
            value={term.value}
            onChange={term.onChange}
          />
        </form>
      </Wrapper>
      <SearchResult
        searchTagLoading={searchTagLoading}
        searchTweetLoading={searchTweetLoading}
        searchUserLoading={searchUserLoading}
        tags={searchTagData}
        tweets={searchTweetData}
        users={searchUserData}
      />
    </>
  );
};

export default SearchInput;
