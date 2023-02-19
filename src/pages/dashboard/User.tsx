import React, { useContext, useEffect, useState } from "react";
import Header from "../../components/header/Header";
import { IoIosSearch } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { AiOutlineFile } from 'react-icons/ai'
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { context } from "../../context/ContextProvider";
import accessSavedToken from "../../utlis/accessSavedToken";
import saveToken from "../../utlis/saveToken";
import config from "../../config/config";
import removeSaveToken from "../../utlis/removeSaveToken";
import { CircularProgress } from "@mui/material";
type AccountData={
  id: string,
  title: string,
  description: string,
  file: string,
  filename: string,
}
const User = () => {
  const [loading, setLoading]= useState(true)
  const [searchLoading, setSearchLoading]= useState(false)
  const [emptySearch, setEmptySearch]= useState(false)
  const [search, setSearch]= useState('')
  const [account, setAccount] = useState([] as AccountData[])
  const {setAcct,setVerifiedUser} = useContext(context)
  const {id} = useParams()
  const navigate= useNavigate()

  useEffect(()=>{
    const fetchDataFunc= async ()=>{
      const result= accessSavedToken()
      const fetchData= await fetch(`${config.userDataLink}/${id}?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`)
      const status= fetchData.status
      const response= await fetchData.json();
      console.log(response)
      if(status== 200){
          const {security,data,userInfo}= response
          console.log(response)
          saveToken(security)
          setVerifiedUser(userInfo.firstname)
          setAccount(data)
      }
      else if(status==500){
          console.log('Something went wrong...')
      }
      else{
          removeSaveToken()
          navigate('/auth/login')
      }
      setLoading(false)
  }
  fetchDataFunc()
  },[])

  const handleSearch =(e:React.ChangeEvent<HTMLInputElement>)=>{
    const target= e.target
    setSearch(target.value)
    setSearchLoading(true)
    const token= accessSavedToken()
    const searchFunc= async ()=>{
      const searchData= await fetch(`${config.userDataLink}/${id}/search?accessToken=${token.accessToken}&refreshToken=${token.refreshToken}&search=${target.value.trim()}`)
      const status= searchData.status
      const response = await searchData.json()
      if(status==200){
          const {security,data}= response
          data.length==0? setEmptySearch(true):setEmptySearch(false)
          saveToken(security)
          setAccount(data)
      }
      setSearchLoading(false)
    }
    searchFunc()
  }
  return (
    <>
      <Header homeLink={`/dashboard/users/${id}`} greetNote="Hi">
        <div className="nav-serach-bar">
            <input type="text" placeholder="Search for files" value={search} onChange={handleSearch}/>
            <span className="icon search-icon" style={{color: searchLoading? '#01d28e': emptySearch?'red':'#666666'}}>
             { searchLoading? <CircularProgress color= 'inherit' size='1rem'/>:
               emptySearch?<IoMdClose />:<IoIosSearch />}
            </span>
          {
            search && <span className="icon close-time-icon" onClick={()=>setSearch('')}>
            <IoMdClose />
          </span>
          }
        </div>
      </Header>
      <main className='body'>
        <div className="container">
          <div className="view">
            <span className="page-view">VIEW</span>
            <span className="active-page">Files</span>
          </div>
          {
            loading?
            (
              <div style={{display: 'flex', justifyContent:'space-between',alignItems:'center', color:'#01d28e'}}>
                  <h1 style={{color: 'inherit'}}>Fetch Data...</h1>
                  <CircularProgress color='inherit' size='2rem'/>
              </div>
            ):

            !loading && Object.keys(account).length>0?
            (
                <>
                  <table>
                    <thead>
                      <tr>
                        <th></th>
                        <th>Title</th>
                        <th>Description</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        account.map((data, index)=>(
                          <tr key={index}>
                            <td>
                              <span className="icon"><AiOutlineFile /></span>
                            </td>
                            <td>{data.title}</td>
                            <td>{data.description}</td>
                            <td className="send-file-link">
                              <Link to={`./mail/${data.id}`}>Send File</Link>
                            </td>
                          </tr>
                        ))
                      }
                      
                    </tbody>
                  </table>
                  <div className="table-foot">
                    <span className="total">Total Files:</span>
                    <span>{account.length}</span>
                  </div>
                </>
            ):
            (
              <h1>No Data Found....</h1>
            )

          }
          
        </div>
      </main>
      <Outlet />
    </>
  );
};

export default User;