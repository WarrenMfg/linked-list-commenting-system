/**
 * Base node for comments and replies
 */
class BaseCommentNode {
  constructor(comment) {
    this.comment = comment;
    this.next = null;
  }
}

/**
 * Comment node
 */
class CommentNode extends BaseCommentNode {
  constructor(comment) {
    super(comment);
    this.replies = new Replies();
  }
}

/**
 * Reply node
 */
class ReplyNode extends BaseCommentNode {}

/**
 * Base linked list
 */
class LinkedList {
  constructor(isReversed = false) {
    this.head = null;
    this.tail = null;
    this.length = 0;
    this.isReversed = isReversed;
  }

  push(node) {
    if (!this.head) {
      this.head = this.tail = node;
    } else if (this.tail) {
      this.tail.next = node;
      this.tail = node;
    }
    this.length++;
    return this;
  }

  unshift(node) {
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.next = this.head;
      this.head = node;
    }
    this.length++;
    return this;
  }

  get(index) {
    if (index < 0 || index >= this.length) return null;
    let counter = 0;
    let comment = this.head;
    while (counter !== index) {
      comment = comment.next;
      counter++;
    }
    return comment;
  }

  reverse() {
    let middle = this.head;
    this.head = this.tail;
    this.tail = middle;

    let next;
    let prev = null;
    for (let i = 0; i < this.length; i++) {
      next = middle.next;
      middle.next = prev;
      prev = middle;
      middle = next;
    }

    this.isReversed = !this.isReversed;
    return this;
  }
}

/**
 * Linked list for comments
 */
class Comments extends LinkedList {
  addComment(comment) {
    const newNode = new CommentNode(comment);
    return this.isReversed ? this.unshift(newNode) : this.push(newNode);
  }

  getComment(index) {
    return this.get(index);
  }

  addReply(commentIndex, reply) {
    const comment = this.getComment(commentIndex);
    if (!comment) return null;
    return comment.replies.addReply(reply);
  }
}

/**
 * Linked list for replies
 */
class Replies extends LinkedList {
  addReply(reply) {
    const newNode = new ReplyNode(reply);
    return this.isReversed ? this.unshift(newNode) : this.push(newNode);
  }
}

// instantiate new comments linked list
let comments = new Comments(true);

// main form input
const input = document.querySelector('input');
// container for all comments
const commentsContainer = document.getElementById('comments-container');

/**
 * Comments
 */
// submit handler for main form
document.getElementById('new-comment').addEventListener('submit', e => {
  e.preventDefault();
  if (!input.value.trim()) return;

  if (commentsContainer.classList.contains('hidden'))
    commentsContainer.classList.remove('hidden');
  comments.addComment(input.value);
  addCommentToDOM(input.value);
  updateDOMDataStructure();
  input.value = '';
});

// add new comment to DOM
const addCommentToDOM = comment => {
  const content = `
    <div class='comment-and-replies-container'>
      <div class='comment-container'>
        <div class='comment'>
          <span>${comment}</span>
          <div class='reply-button-container'>
            <button class='reply-button'>Reply</button>
            <button class='reply-sort'>Sort</button>
          </div>
        </div>
      </div>
    </div>`;
  const location = comments.isReversed ? 'afterbegin' : 'beforeend';
  commentsContainer.insertAdjacentHTML(location, content);
};

// sort comments
document.getElementById('sort-comments').addEventListener('click', () => {
  const commentsAndRepliesContainers = [
    ...document.getElementsByClassName('comment-and-replies-container')
  ];
  if (!commentsAndRepliesContainers.length) return;
  commentsAndRepliesContainers.reverse();
  commentsContainer.append(...commentsAndRepliesContainers);
  comments.reverse();
  updateDOMDataStructure();
});

/**
 * Replies
 */
// delegated event listener for reply button clicks
commentsContainer.addEventListener('click', e => {
  if (!e.target.classList.contains('reply-button')) return;
  const replyForm = document.getElementById('new-reply');
  const commentContainer = e.target.closest('.comment-container');
  // if already a reply form in DOM, remove it
  if (replyForm) {
    const replyFormContainer = replyForm.closest('.comment-container');
    replyForm.remove();
    // if toggling same form, then return
    if (replyFormContainer === commentContainer) return;
  }

  // insert reply form
  commentContainer.insertAdjacentHTML(
    'beforeend',
    `<form class='container' id='new-reply'>
      <input type='text' placeholder='Reply' />
      <button type='submit'>Comment</button>
    </form>`
  );

  // submit handler for rely form
  const newReply = document.getElementById('new-reply');
  newReply.firstElementChild.focus();
  newReply.addEventListener('submit', e => {
    e.preventDefault();
    const reply = e.target.querySelector('input').value;
    if (!reply.trim()) return;
    // get container
    const commentAndRepliesContainer = e.target.closest(
      '.comment-and-replies-container'
    );
    // get index
    const commentIndex = [...commentsContainer.children].indexOf(
      commentAndRepliesContainer
    );
    // make updates
    e.target.remove();
    const replyNode = comments.addReply(commentIndex, reply);
    addReplyToDOM(commentAndRepliesContainer, reply, replyNode.isReversed);
    updateDOMDataStructure();
  });
});

// add new reply to DOM
const addReplyToDOM = (commentAndRepliesContainer, reply, isReversed) => {
  const repliesContainer =
    commentAndRepliesContainer.querySelector('.replies-container');
  let content = `
    <div class='reply'>
      <span>${reply}</span>
    </div>`;
  let location = isReversed ? 'afterbegin' : 'beforeend';

  if (!repliesContainer) {
    content = `<div class="replies-container">${content}</div>`;
    location = 'beforeend';
    commentAndRepliesContainer.insertAdjacentHTML(location, content);
  } else {
    repliesContainer.insertAdjacentHTML(location, content);
  }
};

// sort replies
commentsContainer.addEventListener('click', e => {
  if (!e.target.classList.contains('reply-sort')) return;
  const commentAndRepliesContainer = e.target.closest(
    '.comment-and-replies-container'
  );
  const repliesContainer =
    commentAndRepliesContainer.querySelector('.replies-container');
  if (!repliesContainer) return;

  const commentIndex = [...commentsContainer.children].indexOf(
    commentAndRepliesContainer
  );
  const replies = [...repliesContainer.children].reverse();
  replies.forEach(reply => repliesContainer.appendChild(reply));
  comments.getComment(commentIndex).replies.reverse();
  updateDOMDataStructure();
});

/**
 * Utility
 */
// data structure
const dataStrucuture = document.getElementsByTagName('pre')[0];
const updateDOMDataStructure = () =>
  (dataStrucuture.innerText = JSON.stringify(comments, null, 4)
    .split('\n')
    .map(str => str.replace(/"/, '').replace(/"/, ''))
    .join('\n'));
updateDOMDataStructure();

// clear comments and data structure
document.getElementById('clear').addEventListener('click', () => {
  commentsContainer.innerHTML = '';
  commentsContainer.classList.add('hidden');
  comments = new Comments(true);
  updateDOMDataStructure();
});
