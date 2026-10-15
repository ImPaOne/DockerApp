<?php
$destinations = [
	[
		'name' => 'The quiet side of Kyoto', 'location' => 'Kyoto, Japan', 'category' => 'Culture',
		'image' => 'photo-1493976040374-85c8e12f0c0e', 'description' => 'Lantern-lit lanes, hidden gardens, and mornings that ask you to slow down.', 'time' => '6 min read', 'tag' => 'Slow travel',
	],
	[
		'name' => 'A week in the Dolomites', 'location' => 'South Tyrol, Italy', 'category' => 'Nature',
		'image' => 'photo-1519681393784-d120267933ba', 'description' => 'Alpine lakes, rifugio dinners, and the kind of views you never quite forget.', 'time' => '8 min read', 'tag' => 'Mountain escape',
	],
	[
		'name' => 'Lisbon, one pastel de nata at a time', 'location' => 'Lisbon, Portugal', 'category' => 'City guides',
		'image' => 'photo-1555881400-74d7acaacd8b', 'description' => 'Follow the tiled streets, ride the old trams, and stay for one more sunset.', 'time' => '5 min read', 'tag' => 'City guide',
	],
	[
		'name' => 'Where the desert meets the sea', 'location' => 'Oman', 'category' => 'Nature',
		'image' => 'photo-1509316785289-025f5b846b35', 'description' => 'A road-trip through rose-gold dunes, quiet wadis, and the wild coast.', 'time' => '7 min read', 'tag' => 'Road trip',
	],
	[
		'name' => 'The art of doing nothing in Ubud', 'location' => 'Bali, Indonesia', 'category' => 'Slow travel',
		'image' => 'photo-1537996194471-e657df975ab4', 'description' => 'Rice-field walks, open-air breakfasts, and permission to take it easy.', 'time' => '4 min read', 'tag' => 'Slow travel',
	],
	[
		'name' => 'A local’s guide to Oaxaca', 'location' => 'Oaxaca, Mexico', 'category' => 'Culture',
		'image' => 'photo-1512813195386-6cf811ad3542', 'description' => 'Meet the makers, find the market stalls, and taste the city slowly.', 'time' => '9 min read', 'tag' => 'Culture & food',
	],
];

$newsletterMessage = '';
$newsletterSuccess = false;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['newsletter_email'])) {
	$email = filter_var(trim($_POST['newsletter_email']), FILTER_VALIDATE_EMAIL);
	if ($email) {
		$subscriberFile = '/var/www/data/subscribers.json';
		$handle = @fopen($subscriberFile, 'c+');
		if ($handle === false) {
			error_log('Unable to open newsletter subscriber storage.');
			$newsletterMessage = 'We couldn’t save your signup just now. Please try again later.';
		} elseif (!flock($handle, LOCK_EX)) {
			error_log('Unable to lock newsletter subscriber storage.');
			fclose($handle);
			$newsletterMessage = 'We couldn’t save your signup just now. Please try again later.';
		} else {
			$contents = stream_get_contents($handle);
			$subscribers = $contents === false || $contents === ''
				? []
				: json_decode($contents, true);
			if (!is_array($subscribers)) {
				error_log('Newsletter subscriber storage contains invalid JSON.');
				$newsletterMessage = 'We couldn’t save your signup just now. Please try again later.';
			} else {
				$alreadySubscribed = in_array(strtolower($email), array_map('strtolower', $subscribers), true);
				$saved = true;
				if (!$alreadySubscribed) {
					$subscribers[] = $email;
					$encodedSubscribers = json_encode($subscribers, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
					$saved = $encodedSubscribers !== false
						&& rewind($handle)
						&& ftruncate($handle, 0)
						&& fwrite($handle, $encodedSubscribers) === strlen($encodedSubscribers)
						&& fflush($handle);
				}
				if ($saved) {
					$newsletterMessage = $alreadySubscribed
						? 'You’re already on the list. Look out for our next little note.'
						: 'You’re on the list! Look out for a little inspiration in your inbox.';
					$newsletterSuccess = true;
				} else {
					error_log('Unable to write newsletter subscriber storage.');
					$newsletterMessage = 'We couldn’t save your signup just now. Please try again later.';
				}
			}
			flock($handle, LOCK_UN);
			fclose($handle);
		}
	} else {
		$newsletterMessage = 'Please enter a valid email address and try again.';
	}
}
?>
<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="theme-color" content="#f8f7f3">
	<meta name="description" content="Thoughtful travel guides for curious people. Find your next slow, meaningful escape with The Wayfarer.">
	<title>The Wayfarer — travel, a little more thoughtfully</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">
	<link rel="stylesheet" href="styles.css">
	<script src="script.js" defer></script>
</head>
<body>
<div class="reading-progress" id="reading-progress" aria-hidden="true"><span></span></div>
<div class="announcement"><span class="announcement-dot"></span> A little more wonder, a little less hurry <a href="#stories">Find your next escape <span aria-hidden="true">↗</span></a></div>
<header class="site-header">
	<a class="brand" href="#home" aria-label="The Wayfarer home"><span class="brand-mark" aria-hidden="true">w.</span><span>the wayfarer</span></a>
	<button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false"><span></span><span></span></button>
	<nav class="main-nav" aria-label="Main navigation">
		<a href="#stories">Stories</a><a href="#about">Our philosophy</a><a href="#newsletter">Journal club</a>
		<a class="nav-cta" href="#stories">Explore places <span aria-hidden="true">↗</span></a>
		<button class="theme-toggle" id="theme-toggle" type="button" aria-label="Switch to dark theme" aria-pressed="false"><span aria-hidden="true">☾</span></button>
	</nav>
</header>

<main id="home">
	<section class="hero" aria-labelledby="hero-title">
		<div class="hero-image" role="img" aria-label="A peaceful coastal village tucked into the hills"></div>
		<div class="hero-shade"></div>
		<div class="hero-content">
			<p class="eyebrow hero-eyebrow"><span></span> The art of getting a little lost</p>
			<h1 id="hero-title">Go somewhere<br>that <em>stays</em> with you.</h1>
			<p class="hero-copy">Thoughtful guides for curious people. Find places that make you feel more like yourself.</p>
			<a href="#stories" class="button button-light">Find your kind of elsewhere <span aria-hidden="true">↗</span></a>
			<button class="surprise-button" id="surprise-button" type="button"><span aria-hidden="true">✳</span> Surprise me with a place</button>
		</div>
		<div class="hero-note"><span>01 / 06</span><span class="note-line"></span><span>Somewhere in the Mediterranean</span></div>
		<a class="scroll-cue" href="#stories" aria-label="Scroll to stories"><span></span> SCROLL TO WANDER</a>
	</section>

	<section class="intro section-shell" id="about" data-reveal>
		<div class="intro-label"><span class="eyebrow">A different kind of travel guide</span><span class="tiny-sun" aria-hidden="true">✳</span></div>
		<div class="intro-copy"><h2>Not just places to go.<br><em>Ways to feel.</em></h2><p>We believe the best trips aren’t measured in miles, but in moments. The warm bread you didn’t plan to find. The long way home. The stranger who felt like a friend.</p><a class="text-link" href="#newsletter">A little about us <span aria-hidden="true">↗</span></a></div>
		<div class="intro-aside"><span class="aside-number">01</span><p>Travel with intention.<br>Come back with a story.</p></div>
	</section>

	<section class="stories-section" id="stories" data-reveal>
		<div class="section-shell">
			<div class="section-heading">
				<div><p class="eyebrow">Notes from out there</p><h2>Stories for the <em>long way round.</em></h2></div>
				<p class="section-description">Field notes, local favorites, and gentle nudges to go see for yourself.</p>
			</div>
			<div class="story-tools">
				<div class="filter-list" role="group" aria-label="Filter stories by category">
					<button class="filter-chip active" data-filter="All stories" type="button">All stories <span>06</span></button>
					<button class="filter-chip" data-filter="Culture" type="button">Culture</button>
					<button class="filter-chip" data-filter="Nature" type="button">Nature</button>
					<button class="filter-chip" data-filter="City guides" type="button">City guides</button>
					<button class="filter-chip" data-filter="Slow travel" type="button">Slow travel</button>
					<button class="filter-chip saved-filter" data-filter="Saved" type="button" aria-pressed="false">Saved <span id="saved-count">0</span></button>
				</div>
				<div class="story-actions">
					<label class="search-box"><span class="search-icon" aria-hidden="true">⌕</span><span class="visually-hidden">Search stories</span><input id="story-search" type="search" placeholder="Find a feeling…" autocomplete="off"><kbd>/</kbd></label>
					<label class="sort-box"><span class="visually-hidden">Sort stories</span><select id="story-sort"><option value="featured">Featured</option><option value="title">A to Z</option><option value="reading-time">Quick reads</option></select></label>
				</div>
			</div>
			<p class="results-count" id="results-count" aria-live="polite">Showing 6 thoughtful escapes</p>
			<div class="story-grid" id="story-grid">
				<?php foreach ($destinations as $destination): ?>
					<article class="story-card" data-reveal data-category="<?= htmlspecialchars($destination['category'], ENT_QUOTES, 'UTF-8') ?>" data-search="<?= htmlspecialchars(strtolower($destination['name'] . ' ' . $destination['location'] . ' ' . $destination['description'] . ' ' . $destination['category']), ENT_QUOTES, 'UTF-8') ?>">
						<a class="story-image-link" href="#newsletter" aria-label="Read <?= htmlspecialchars($destination['name'], ENT_QUOTES, 'UTF-8') ?>">
							<img class="story-image" src="https://images.unsplash.com/<?= htmlspecialchars($destination['image'], ENT_QUOTES, 'UTF-8') ?>?auto=format&fit=crop&w=900&q=85" alt="<?= htmlspecialchars($destination['location'], ENT_QUOTES, 'UTF-8') ?> travel scenery" loading="lazy">
							<span class="story-tag"><?= htmlspecialchars($destination['tag'], ENT_QUOTES, 'UTF-8') ?></span>
						</a>
						<div class="story-details"><div class="story-meta"><span><?= htmlspecialchars($destination['location'], ENT_QUOTES, 'UTF-8') ?></span><span><?= htmlspecialchars($destination['time'], ENT_QUOTES, 'UTF-8') ?></span></div>
							<div class="story-title-row"><h3><a href="#newsletter"><?= htmlspecialchars($destination['name'], ENT_QUOTES, 'UTF-8') ?></a></h3><button class="save-button" type="button" aria-label="Save <?= htmlspecialchars($destination['name'], ENT_QUOTES, 'UTF-8') ?>" aria-pressed="false"><span aria-hidden="true">♡</span></button></div>
							<p><?= htmlspecialchars($destination['description'], ENT_QUOTES, 'UTF-8') ?></p>
							<a class="read-link" href="#newsletter">Read the field notes <span aria-hidden="true">↗</span></a>
						</div>
					</article>
				<?php endforeach; ?>
			</div>
			<div class="empty-state" id="empty-state" hidden><span aria-hidden="true">☼</span><h3>No stories found just yet.</h3><p>Try another place, feeling, or category.</p></div>
			<div class="all-stories"><a class="button button-outline" href="#newsletter">More stories are on their way <span aria-hidden="true">↗</span></a></div>
		</div>
	</section>

	<section class="quote-band" data-reveal><div class="quote-mark" aria-hidden="true">“</div><blockquote>We travel not to escape life, but for life not to escape us.</blockquote><p>— Robyn Yong, somewhere on the road</p><span class="quote-orbit" aria-hidden="true">✳</span></section>

	<section class="newsletter-section" id="newsletter" data-reveal>
		<div class="newsletter-art" role="img" aria-label="A sunlit Mediterranean coastline"></div>
		<div class="newsletter-panel"><p class="eyebrow">A postcard, not a pile of emails</p><h2>A little wonder<br>for your <em>inbox.</em></h2><p class="newsletter-copy">Our monthly note is full of places to daydream about, stories worth lingering over, and ideas for your next good trip.</p>
			<form class="newsletter-form" method="post" action="#newsletter" novalidate><label class="visually-hidden" for="newsletter-email">Your email address</label><input id="newsletter-email" name="newsletter_email" type="email" placeholder="Your email address" required><button type="submit" aria-label="Subscribe to the newsletter">I’m in <span aria-hidden="true">↗</span></button></form>
			<p class="form-message <?= $newsletterSuccess ? 'success' : '' ?>" aria-live="polite"><?= htmlspecialchars($newsletterMessage, ENT_QUOTES, 'UTF-8') ?></p><p class="privacy-note">No noise, ever. Unsubscribe whenever.</p>
		</div>
	</section>
</main>

<footer class="site-footer"><a class="brand footer-brand" href="#home"><span class="brand-mark" aria-hidden="true">w.</span><span>the wayfarer</span></a><p>For the places that find their way into you.</p><div class="footer-bottom"><span>© <?= date('Y') ?> The Wayfarer Journal</span><div><a href="#about">Our story</a><a href="#newsletter">Get in touch</a><a href="#home">Back to top ↑</a></div><span>Made for the curious <span class="footer-heart">♥</span></span></div></footer>
<div class="site-toast" id="site-toast" role="status" aria-live="polite"></div>
<button class="back-to-top" id="back-to-top" type="button" aria-label="Back to top" hidden>↑</button>
</body>
</html>
