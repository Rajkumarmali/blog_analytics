const express = require('express');
const app = express();

const _ = require('lodash');
const axios = require('axios');


app.get('/api/blog-stats', async (req, res) => {
    try {
        const blogData = await fetchBlogData();
        const totalBlogs = blogData.blogs.length;
        const longestTitleBlog = findLongestTitleBlog(blogData.blogs);
        const privacyTitleCount = countPrivacyTitle(blogData.blogs);
        const uniqueTitles = getUniqueTitle(blogData.blogs);

        res.send({
            //Blog: blogData,
            TotalBlogs: totalBlogs,
            LongestTitleBlog: longestTitleBlog,
            Privacy: privacyTitleCount,
            UniqueTitle: uniqueTitles,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred while fetching and analyzing the data.");
    }
});


app.get('/api/blog-search', async (req, res) => {
    const query = req.query.query;
    const blogData = await fetchBlogData();
    const searchResults = searchBlog(blogData.blogs, query);
    res.send(searchResults);
});


fetchBlogData = async () => {
    const apiUrl = 'https://intent-kit-16.hasura.app/api/rest/blogs';
    const adminSecret = '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6';

    const response = await axios.get(apiUrl, { headers: { 'x-hasura-admin-secret': adminSecret } });

    return response.data;
}

app.get('/api/blog-stats', async (req, res) => {
    try {
        const blogData = await fetchBlogData();
        const analyticsResult = memoizedAnalyzeBlogs(blogData.blogs);
        res.send(analyticsResult);
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred while fetching and analyzing the data.");
    }
});

app.get('/api/blog-search', async (req, res) => {
    const query = req.query.query || '';
    const searchResult = memoizedSearchBlogs(query);
    res.send(searchResult);
})


findLongestTitleBlog = (blogData) => {
    return _.maxBy(blogData, (blog) => (blog.title ? blog.title.length : 0));
};

countPrivacyTitle = (blogData) => {
    return _.filter(blogData, blog => blog.title.toLowerCase().includes('privacy')).length;
};

const getUniqueTitle = (blogData) => {
    return _.unionBy(blogData, 'Title').map(blog => blog.Title);
};


const searchBlog = (blogData, query) => {
    const searchResults = _.filter(blogData, blog => blog.title.toLowerCase().includes(query.toLowerCase()));
    return searchResults;
};

const performAnalytics = (blogData) => {
    const totalBlogs = blogData.blogs.length;
    const longestTitleBlog = findLongestTitleBlog(blogData.blogs);
    const privacyTitleCount = countPrivacyTitle(blogData.blogs);
    const uniqueTitles = getUniqueTitle(blogData.blogs);

    return {
        TotalBlogs: totalBlogs,
        LongestTitleBlog: longestTitleBlog,
        Privacy: privacyTitleCount,
        UniqueTitle: uniqueTitles,
    };
};

const memoizedAnalyzeBlogs = _.memoize(performAnalytics, (blogData) => 'analytics');
const memoizedSearchBlogs = _.memoize(searchBlog, (query, cacheKey) => cacheKey || 'search')







const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
