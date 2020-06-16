
const deleteProduct = (btn) => {
   // console.log(btn)
   const prodId = btn.parentNode.querySelector('[name=productId]').value;
   const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
   
   const productElement = btn.closest('article')

   //fetch() is a method supported by the browser for sending requests. It's not just ofr fetching data, it's also for sending data.
   //The first argument is where to send the request to, and the second argument is an object where you can configure the fetch() request
   fetch('/admin/product/' + prodId, {
       method: 'DELETE',
       headers: {
           'csrf-token': csrf
       }
   }).then(result => {
       return result.json();
   })
   .then(data => {
       console.log(data);
       //productElement.remove(); does not work in internet explorer
       productElement.parentNode.removeChild(productElement);
   })
   .catch(err => {
       console.log(err)
   });
}