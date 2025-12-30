import React, { useEffect } from "react";

import styles from './Page1.module.css'



// line no: 57,97,260,261,303,309

// export default function Page1({ data, user }: { data: any, user?: any }) {
export default function Page1({ data }: { data: any}) {

const financialYear = (date: string) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // Jan = 1

  if (month >= 4) {
    return `${year}`;
  } else {
    return `${year - 1}`;
  }
};

   useEffect(() => {
    console.log("Page1 received data:", data);
    // console.log(financialYear(data.details.OrderDate))
  }, [data]);
  if (!data) {
    return <div>Loading data or no data available...</div>;
  }

  

  const formatDate = (dateString:string) => {
  // console.log("date",dateString)
  const d = new Date(dateString);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();


  return `${day}-${month}-${year}`;
}



    

  return (
    <div>
     
      <div className={styles.pageContainer}>
        <div className={styles.info}>
          <div>

            <p>दूरध्वनी 022-2266 4583/3678 <br/>फैक्स 022-2256 2077 <br/>ईमेल cqaems@navy gov.in <br/>वेबसाइट इट www.dggadefence.gov.in  </p>

          </div>

          <div>
              <p>रक्षा मंत्रालय (ग.अ.म. नि) <br/>Ministry of Defence (DGQA)<br/>मुख्य गुणवत्ता आश्वासन स्थापना (कल-पुर्जे)<br/>Chief quality Assurance Establishment<br/>7वी मंजिल एन एन आर एन कोम्प्लेक्स <br/>7th Floor, NMRL Complex<br/>नेवल डॉकयार्ड, टाइगर गेट<br/>Naval Dockyard, Tiger Gate<br/>मुंबई Mumbai - 400 023</p>
            </div>  
          </div>

          <div className={styles.file}>
            <p>CQAE(MS): {data.details.ConsigneeCode} 
              {/* {user.fileNo}   */}    {/*Work here*/}
              </p>
            <p>Date: {formatDate(data.details.OrderDate)}</p>  
          </div>

          <div className={styles.letterStart}>
            <p>सेवा में,</p>
            <p>{data.vendor.FirmAddress}</p>
            <p>श्री मान जी,</p>
          </div>

        <div className={styles.table}>
          <div>
              <p>1.</p>
          </div>

          <div>
            <p>निम्नलिखित इंस्पेक्शन (नोट की प्रतियां 1 से 5)इस स्थापना द्वारा प्रगति  हेतु भेजी जा रही हैं"</p>
            
            <table className={styles.customTable}>
              <thead>
                <tr>
                 
                  <th>
                    इन्स्पेक्सन नोट संख्या और तारीख
                  </th>
                  
                  <th>
                    आपूर्ति आदेश संख्या और तारीख
                  </th>
                  
                  <th>
                    वस्तु का विवरण
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  
                  <td>
                    <div>
                      <span className={styles.highlight}>{data.inspectionNo} </span>   {/*work here*/ }
                    </div>
                    <div className={styles.dateRow}>
                      Dated <span className={styles.highlight}>{formatDate(data.details.OrderDate)}</span>
                    </div>
                  </td>

                  
                  <td>
                    <div>
                      <span className={styles.highlight}>{data.supplyOrderNo}</span>
                      <span className={styles.noteMarker}></span>
                    </div>
                    <div className={styles.dateRow}>
                      <p className={styles.noteMarker}>{data.header.IndentNo}</p>
                      Dated <span className={styles.highlight}>{formatDate(data.details.OrderDate)}</span>
                      
                    </div>
                  </td>

                  
                  <td>
                    Spares
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>


        <div className={styles.app}>
          <p>2.</p>
          <p>आपसे अनुरोध है कि उपरोक्त ईन्सपैक्सन नोट में वर्णित वस्तुओ को कन्ट्रोलर आफ वेयर हाउसींग (सप्लाई ओर्डर के अनुसार) को भेज दीजिए और दस्तावेज की सूचना इस कार्यालय को भी दे |</p>
        </div>

        <div className={styles.thank}>
          <p>धन्यवाद</p>
          <div className={styles.bhavday}>
            <p>भवदीय</p>
            <p>कृते सी क्यू ए ओ (एम एम)</p>
          </div>
          <div className={styles.end}></div>
          <p>संलग्नक : उपरोक्त दस्तावेज</p>
          <p>प्रतिलिपि :-</p>
        </div>

        <div className={styles.DirAddress}>
          <p>
            The Additional Director General <br /> (for Director/Technical)  <br/>Directorate of Quality Assurance (WP) <br/>
            Defence Office Complex <br/>'B' Block,6th Floor,Africa Avenue <br/>Sarojinil Nagar Post Office <br/>New Delhi - 110023
          </p>

          <p>ईन्सपैक्सन नोट की कापी न . 7 के साथ</p>
          
        </div>

        <div className={styles.warehouse}>
          <p>{data.modetail.MoAddress}</p>   
          <p>ईन्सपैक्सन नोट की कापी न . 6 के साथ</p>
        </div>
        <div className={styles.controller}>
          <p>{data.modetail.MoAddress}</p>
          <p>ईन्सपैक्सन नोट की कापी न . 5 के साथ</p>
        </div>
      </div>


      <div className={styles.page2}>
        <header className={styles.header}>

         
            <p>भारत सरकार <br/> GOVERMENT OF INDIA <br/> (पूर्ति विभाग )<br/> Department of Supply</p>
          

          
            <p className={styles.headerchild2}>निरीक्षण पत्र<br/> <strong>INSPECTION NOTE</strong> <br/>1 - निरीक्षण पत्र <br/> INSPECTION NOTE NO. {financialYear(data.details.OrderDate)}-022-{data.iNote}-WP-02<br/><strong>1 - निरीक्षण प्रमाण पत्र</strong> </p>
          

          
            <p>म . नि . पू . नि . (एम) ८४<br/>In lieu of D.G.S &D (S)-84</p>

         
        </header>

        <div className={styles.inspection}>
          <p><strong>I- Inspection Certificate</strong></p>

          <div className={styles.inspectionInfo}>
            <p>पूरी / आंशिक / अतिरिक्त आंशिक / समापन सुपुर्दगी<br/>Delivery Full/Part/Further part/Completion</p>
            <p>फाइल सं .<br/>File No. {data.fileNo}</p>
            <p>इश्यू सं .<br/>Issue No. 1</p>
          </div>

          <div className={styles.InspectionInfo2}>
            <p>*जो व्योरा आवश्यक न हों उन्हें काट दें ।<br/>**Particulars Not Required to be deleted</p>
            <p>प्रति सं<br/>Copy No.2</p>
            <p>प्रतियों की सं<br/>Number of Copies 7</p>
          </div>

        </div>

        <div className={styles.afterInspection}>
          <div className={styles.chalu}>
            <p>1.महानिदेशक (पूर्ति तथा निपटान)/ पूर्ति निदेशक (वस्त्र)दर/चालू ठेका/नि .स्वी .सं . और तारीख आदेश सं . और तारीख . . . </p>
            <p className={styles.supply}>Supply Order No and Date</p>
          </div>
          <div className={styles.DG}>
            <p>DG(S&D)/Dir.(S&D)/D.S(tax)/Rate/Running COntract/A.T.No and Date </p> 
            <p>{data.header.IndentNo} {formatDate(data.details.OrderDate)}</p> 
          </div>

          <div className={styles.naam}>
            <p>2.का नाम और पता<br/>Contractor's name and Address</p>
            <p>{data.vendor.FirmAddress}</p>
          </div>

          <div className={styles.indent}>
            <p>3.मांगकर्ता<br/>Indentor </p>
            <p>{data.header.IndentNo}</p>
          </div>
 
          <div className={styles.IndDate}>
            <p>4.मांग-पत्र सं. और तारीख<br/>Indent No. and date</p>
            <p>{data.details.ConsigneeCode} </p>
            <p>Dated {formatDate(data.currDate)}</p>
          </div>

          <div className={styles.Consignee}>
            <p>5.प्रेषिती<br/>Consignee</p>
            <p>{data.details.ConsigneeCode}</p>
          </div>

          <div className={styles.accepted}>
            <p>6.प्रमाणित किया जाता है कि नीचे और इसी क्रम में संलग्न पत्र में दर्ज माल का निरीक्षण किया जा चुका है और परिणाम इस प्रकार है<br/>Certified thaat stores noted below and in the continuation sheets attached have been inspected with results as shown</p>
            <p><strong>Accepted</strong></p>
          </div>

          <div className={styles.offer}>
            7.
            <div className={styles.insideOffer}>
              <div>
                <p>(क) तारीख को सुपुर्द किए गए / रेल पर रखे गये/ निरीक्षण के लिए रखे गए सामान </p>
                <p>(ख)मान निरीक्षण करने की तारीख . . . .</p>
              </div>
              <div>
                <p>(a) Stores Offered for inspection on  {data.inspectionDate} </p>
                <p>(b) Stores inspected on {data.inspectionEvaluation}</p>
              </div>
            </div>
          </div>

          <div>
            <p>8. के सुपुर्दगी पत्र की संख्या और तारीख<br/>Delivery Note no and Date</p>
          </div>

          <div>
            <p>9.समय के अंदर अथवा सक्षम पाधिकारी द्वारा बढ़ाए गए समय के अंदर मदों की पूर्ति की गई / नहीं की गई दण्ड के लिए पूर्ति अधिकारी को भेजी गई सूचना <br/>
            The items were/were not supplied within the stipulated time or as extended by tge competent authority/reference made to Supply Officer regarding penality</p>
          </div>

        </div>

        <div className={styles.Detail}>
          <p className={styles.detailHeader}>निरीक्षण सामान का ब्यौरा<br/><strong>DETAILS STORE INSPECTED</strong></p>
        <div className={styles.HinDescription}>
            <p>निविदा स्वीकृति में मद संख्या</p>
            <p>सामान का विवरण कुल कितनी मात्रा में आर्डर दिया जहाँ डिब्बे मे सामान भेजा जाना हो वहाँ निरीक्षक को इस वात का संकेत देना चाहिए कि क्या पूर्ति विक्रेता केता के डिब्बे मे की गई है</p>
            <p>लेखा एकक</p>
            <p>स्वीकृत</p>
            <p>खाता पन्ना मे दर्ज किया गया आज की तारीख तक स्वीकृत कुल मात्रा</p>
            <p>अस्वीकृति</p>
            <p>डी . जी . आई . एस . एम . लंदन या विदेश के किसी दूसरे पाधिकारी द्वारा जारी किए (यदि कोई हों) निरीक्षण प्रमाण की सं . और तारीख</p>
        </div>

          <div className={styles.EngDescription}>
            <p>Itemm No in A/T</p>
            <p><span>Description of stores </span><br/>Total Quantity Ordered<br/> The Inspector should indiate wheather the supply has been made in seller's/buyer's Coontainers, where stores are required in the supplied in Coontainers</p>
            <p>Acc Unit</p>
            <p>Tendered Quantity </p>
            <p>Accepted Quantity</p>
            <p>Brought to account in ledger folio Total Qty Accepted to Date</p>
            <p>Rejected Quantity </p>
            <p>No and date of ispection certificate(if any) issued by DGISM or other Insp Authonty abroad</p>
            <p>Remarks</p>
          </div>
        </div>

        <div>
          <p><span className={styles.Remark}>Remark:</span><span>TOTAL ITEMS ACCEPTED ARE {data.something} NOS AND DETAILS ARE PLACED AT THE ANNEXURE I TO THIS I-NOTE</span></p>
          <p>टिप्पणी : अंतिम मद के बाद में तत्काल एक रेखा खींची जाएगी या टाइप की जाएगी | रेखा के नीचे "भंडार का विवरण" नाम के खाने में पृथक रूप में दी गई मदों की कुल संख्या इस प्रकार दर्ज की जाएगी | निरीक्षण की गई मदों की संख्या . . . . . . . . . . . . . . . . . . . . . . . . . . (शब्दों में)</p>
          <p>Note-- A line to be drawn or typed immediately after the last item Below the line will be entered the total no of items separately shown in the Col "DESCRIPTION OF STORES" thus---</p>
        </div>

        <div className={styles.InspectItem}>
          <p className={styles.InspectItemHeader}>ITEMS INSPECTED NOS ONLY{}</p>
          <div className={styles.placeDate}>
            <div>
              <p>स्थान / Station Mumbai</p>
              <p>तारीख / Date {formatDate(data.header.OrderDate)}</p>
            </div>
            <div>
              <p>निरीक्षक के हस्ताक्षर/Signature of CQAO(MS)</p>
              <p>पदनाम मोहर सहित/Designation(with rubber stamp)</p>
            </div>
          </div>

          {/* <div className={styles.Signature}>
            <p>निरीक्षक के हस्ताक्षर/Signature of CQAO(MS)</p>
            <p>पदनाम मोहर सहित/Designation(with rubber stamp)</p>
          </div>*/}
        </div> 

      </div>




      <div className={styles.page3}>
        <header className={styles.header}>

         
            <p>भारत सरकार <br/> GOVERMENT OF INDIA <br/> (पूर्ति विभाग )<br/> Department of Supply</p>
          

          
            <p className={styles.headerchild2}>निरीक्षण पत्र<br/> <strong>INSPECTION NOTE</strong> <br/>1 - निरीक्षण पत्र <br/> INSPECTION NOTE NO. {financialYear(data.header.OrderDate)}-022-{data.iNote}-WP-02<br/><strong>1 - निरीक्षण प्रमाण पत्र</strong> </p>
          

          
            <p>म . नि . पू . नि . (एम) ८४<br/>In lieu of D.G.S &D (S)-84</p>

         
        </header>
        
        <div className={styles.inspectionCopy}>
           <p>10.</p>
           <p> केवल निरीक्षक की कार्यालय प्रति (सं 7) में दर्ज किया जाए | अस्वीकृत माल वापस करने की रेलवे की सं. और तारीख <br/> To be entered on inspection office copy (no 7) only (No and Date of Railway Receipt returning rejection............)</p>
           
        </div>

        <div className={styles.inspectionSign}>
            <p>को अस्वीकृत सामान प्राप्त हुआ </p>
            <p>ठेकेदार के हस्ताक्षर</p>
            <div className={styles.inspectionSignChild}>
              <p>(Contractor Signature..................................Received the Rejection On..................................)</p>
          </div>
        </div>
        

        <div className={styles.inspectionCopy}>
          <p>11.</p>
          <p>उन मामलों जहाँ 90%/95%/98% अग्रिम अदायगी का दावा किया गया तथा निरीक्षण पत्र की प्रति संख्या 2, 4 और 5 में ठेकेदार दर्ज करेगा | 90%/95%/98% अग्रिम बिल की सं और तारीख<br/>To be entered on copies No 2, 4, and 5 of the inspection Note by the contractor in case in which Advance 90%/95%/98% payment has been claimed</p>
        </div>

        <div className={styles.certificate}>
            <p>II - प्राप्ति प्रमाण पत्र</p>
            <p><strong>II - RECEIPT CERTIFICATE</strong></p>
        </div>

        <div>
          <p>(परेषिती अंतिम 100% अदायगी प्रति सं. 1, 2, 4 और 5 में और अग्रिम 90%/95%/98% अदायगी तथा शेष 10%/5%/2% अदायगी के मामले में प्रति सं. 2, 4 और 5 में दर्ज करेगा)| </p>
          <p> To be completed by consignee on copies no 1, 2, 4 and 5 for Final 100% payment and on copies No 2, 4, 5 for advance 95%/98% payment and balance 10%/5%/2% payment</p>
        </div>

        <div className={styles.certified}> 
          <p>1.प्रमाणित किया जाता है कि पिछले पृष्ठ पर और . . . . . . . . . . . . जारी संलग्न पत्रों पर प्राप्त दिखाया गया सामान नीचे 3 में दी गई अभ्युक्तियों के अधीन अच्छी हालत में प्राप्त हुआ है</p>
          <div className={styles.PrmanTable}>
            <table className={styles.customTable2}>
              <thead>
                <tr>
                 
                  <th>
                    <div>मद</div>
                    <div>Item</div>
                  </th>
                  <th>
                    <div>कारण</div>
                    <div>Reason</div>
                  </th>
                  <th>
                    <div>रकम</div>
                    <div>₹ Amount</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  
                  <td>
                    
                      
                    
                  </td>

                  
                  <td>
                    
                  </td>

                  
                  <td>
                   
                  </td>
                </tr>
              </tbody>
            </table>

            <table className={styles.customTable2}>
              <thead>
                <tr>
                 
                  <th>
                    <div>मद</div>
                    <div>Item</div>
                  </th>
                  <th>
                    <div>कारण</div>
                    <div>Reason</div>
                  </th>
                  <th>
                    <div>रकम</div>
                    <div>₹ Amount</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  
                  <td>
                    
                  </td>

                  
                  <td>
                    
                  </td>

                  
                  <td>
                    
                  </td>
                </tr>
              </tbody>
            </table>
          </div>  
          <div className={styles.area}>
              <p>मंडल या क्षेत्र <br/> Circle of area: ..............</p>
              <p>स्थान <br/> Station: ..........</p>
              <p>हस्ताक्षर <br/> Signature: ..........</p>
          </div>
          <div className={styles.Designation}>
              <p>तारीख <br/> Dated: ..........</p>

              <p>पदनाम <br/> Designation: ................................ </p>
          </div>
          </div>

          

          <div>
            <p>
              (स्थानीय परिदान के मामले में)<br/>
             ( In the case of a Local Delivery)
            </p>
            <p>
                यह एक कच्ची रसीद है । वह केवल परेषिती द्वारा सामान मिलने की रसीद मानी जाएगी और मात्र इससे ठेके की सामान्य शर्तों के अधीन सामान का निरीक्षण करने और उसे अस्वीकृत करने से उससे अधिकारों पर कोई प्रतिकूल प्रभाव नहीं पड़ेगा , यह इस कथित आधार पर जारी की जाती है कि ठेकेदार वास्तव में परिदत्त की कुल मात्रा को सिद्ध करने के लिए उत्तरदायी होगा । <br/><br/>

              This is the provisional receipt. In only below Months receipt of Stores by the consignee and is without prejudice to his right of inspection and rejection under the general condition to contract. It is issued on said to contain basis the contractor remaining responsible for proving the total quantities, actually delivered.
            </p>
          </div>  

          <div className={styles.station}>
            <p>स्थान / <span>Station: ................................</span></p>

            <p>परेषिती के हस्ताक्षर / <span>Signature of Consignee: ................................</span></p>
          </div>
          <div className={styles.rubberStamp}>
            <p>तारीख /<span>Date: ................................</span></p>
            <p>पदनाम मोहर सहित / <span>Designation (with rubber stamp): ................................</span></p>
          </div>

          <div className={styles.note}>
            <p>नोट/ <span>Note:-</span></p>
            <div className={styles.note1}>
              <p>1.</p>
              <p>इस प्रमाण - पत्र पर नि . स्वी . या पू आदेश में निर्दिष्ट परेषिती के हस्ताक्षर स्याही में होने चाहिए। जहाँ यह संभव न हो अथवा असुविधाजनक हो वहाँ परेषिती द्वारा विधिवत अधिकारी के हस्ताक्षर होने चाहिए। ऐसी स्थिति में रसीद प्रमाण पत्र पर हस्ताक्षर करने वाले अधिकारी को अपना तथा जिसकी ओर से वह हस्ताक्षर कर रहा है उस अधिकारी के पदनाम का उल्लेख करना चाहिए।<br/><br/>This Certificate Should be Signed in ink by the Consignee Specified in the A/T or S/Order. Where this is not possible or inconvenient It should be signed in by an officer duly authorised by the consignee in that behalf. In such case the official signing the receipt Certificate should indicate his designation of the official on whose behalf he is signing.</p>
            </div>
            
            <div className={styles.note2}>
              <p>2.</p>
              <p> प्रेषिती को चाहिए कि वह सामान प्राप्त होने की तारीख के ................................... के अन्दर इन प्रतियों को आवश्यक टिप्पणी सहित अवश्य लौटा दें। <br/> <br/>English: Consignee must return these copies with his remarks as required within...................................from the date of receipt of Stores.</p>
            </div>

            <div className={styles.note3}>
              <p>3.</p>
              <p>यदि सभी सामान अस्वीकृत कर दिया जाए तो केवल प्रति सं 3,6,7 और 9 ही जारी की जाएंगी। <br/><br/>English: In case of total rejection copies Nos 3,6,7 and 9 only will be issued.</p>
            </div>
            
              
          </div>

        
      </div>

    </div>

  );
}
