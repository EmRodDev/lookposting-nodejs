exports.showJobs = (req, res) => {
    res.render('home',{
        namePage: 'LookPosting',
        tagline: 'Find and publish jobs for web developers',
        bar: true,
        button: true
    });
};